import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Person, District, Coordinates } from '../types';
import { refineNeedDescription } from '../services/geminiService';
import { Search, MapPin, UserCheck, AlertCircle, Loader2, Filter, Plus, Upload, AlertTriangle, Info, ChevronDown, ChevronUp, X, Trash2, Sparkles } from 'lucide-react';
import { ReliefMap } from '../components/Map/ReliefMap';
import { LocationPicker } from '../components/Map/LocationPicker';

export const PersonFinder: React.FC = () => {
  const { people, addPerson, deleteWithPin, updatePerson } = useApp();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SAFE' | 'MISSING'>('MISSING');
  const [filterDistrict, setFilterDistrict] = useState<District | 'ALL'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Report Form State
  const [reportForm, setReportForm] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    district: District.COLOMBO,
    lastSeenLocation: '',
    lastSeenDate: '',
    coordinates: undefined as Coordinates | undefined,
    physicalDescription: '',
    image: '',
    reporterName: '',
    reporterContact: '',
    message: '',

    disclaimerChecked: false,
    secretPin: '',
    descriptionTranslations: undefined as { en: string; si: string } | undefined
  });

  // Edit Mode State
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<Coordinates | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleImproveDescription = async () => {
    setIsImproving(true);
    try {
      const result = await generateBilingualDescription({
        name: reportForm.name,
        age: reportForm.age,
        gender: reportForm.gender,
        lastSeenLocation: reportForm.lastSeenLocation,
        lastSeenDate: reportForm.lastSeenDate,
        physicalDescription: reportForm.physicalDescription,
        district: reportForm.district
      });

      setReportForm(prev => ({
        ...prev,
        physicalDescription: t.lang === 'si' ? result.si : result.en,
        descriptionTranslations: result
      }));
    } catch (error: any) {
      console.error("AI Improvement failed:", error);
      alert(`AI Refinement failed: ${error.message || "Unknown error"}. Please check your internet connection or API key.`);
    } finally {
      setIsImproving(false);
    }
  };

  // Auto-translate description when language changes
  useEffect(() => {
    if (reportForm.descriptionTranslations) {
      const newDesc = t.lang === 'si' ? reportForm.descriptionTranslations.si : reportForm.descriptionTranslations.en;
      if (newDesc && newDesc !== reportForm.physicalDescription) {
        setReportForm(prev => ({ ...prev, physicalDescription: newDesc }));
      }
    }
  }, [t.lang, reportForm.descriptionTranslations]);

  const filteredPeople = useMemo(() => {
    const result = people.filter(p => {
      const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.nic || '').includes(searchTerm) ||
        (p.district?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const personStatus = (p.status || 'MISSING').toUpperCase();
      const matchesStatus = filterStatus === 'ALL' || personStatus === filterStatus;
      const matchesDistrict = filterDistrict === 'ALL' || p.district === filterDistrict;

      return matchesSearch && matchesStatus && matchesDistrict;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.updatedAt || 0) - (a.updatedAt || 0);
      return (a.updatedAt || 0) - (b.updatedAt || 0);
    });

    return result;
  }, [people, searchTerm, filterStatus, filterDistrict, sortBy]);



  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.disclaimerChecked) {
      alert('Please accept the disclaimer to proceed.');
      return;
    }

    if (!reportForm.coordinates) {
      alert('Please select a location on the map to ensure the person can be found.');
      return;
    }

    if (!reportForm.secretPin || reportForm.secretPin.length !== 4) {
      alert('Please enter a 4-digit Secret PIN to manage this report later.');
      return;
    }

    const person: Person = {
      id: Date.now().toString(),
      name: reportForm.name,
      age: parseInt(reportForm.age),
      gender: reportForm.gender,
      district: reportForm.district,
      lastSeenLocation: reportForm.lastSeenLocation,
      lastSeenDate: reportForm.lastSeenDate,
      coordinates: reportForm.coordinates,
      status: 'MISSING', // Default to MISSING for this form
      physicalDescription: reportForm.physicalDescription,
      image: reportForm.image,
      reporterName: reportForm.reporterName,
      reporterContact: reportForm.reporterContact,
      reportedBy: reportForm.reporterName || 'Anonymous',
      message: reportForm.message,
      updatedAt: Date.now(),
      secretPin: reportForm.secretPin
    };

    setIsSubmitting(true);

    setIsSubmitting(true);

    if (editingPersonId) {
      // Update existing person
      const updateData: Partial<Person> = {
        ...person,
        id: editingPersonId, // Keep original ID
        updatedAt: Date.now()
      };

      updatePerson(editingPersonId, updateData, reportForm.secretPin)
        .then(() => {
          alert('Report updated successfully.');
          setActiveTab('search');
          resetForm();
          setEditingPersonId(null);
        })
        .catch((error: any) => {
          console.error("Update error:", error);
          alert(`Failed to update report: ${error.message || "Unknown error"}`);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      // Create new person
      addPerson(person)
        .then(() => {
          alert('Report submitted successfully.');
          setActiveTab('search');
          resetForm();
          alert('Report submitted successfully! Save your PIN: ' + reportForm.secretPin);
        })
        .catch((error: any) => {
          console.error("Submission error:", error);
          alert(`Failed to submit report: ${error.message || "Unknown error"}. If the image upload failed, please check your internet connection or try a smaller image.`);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const resetForm = () => {
    setReportForm({
      name: '',
      age: '',
      gender: 'Male',
      district: District.COLOMBO,
      lastSeenLocation: '',
      lastSeenDate: '',
      coordinates: undefined,
      physicalDescription: '',
      image: '',
      reporterName: '',
      reporterContact: '',
      message: '',
      disclaimerChecked: false,
      secretPin: '',
      descriptionTranslations: undefined
    });
  };

  const handleLocationSelect = (coords: Coordinates, address?: string, district?: District) => {
    setReportForm(prev => ({
      ...prev,
      coordinates: coords,
      lastSeenLocation: address ? address.split(',')[0] : prev.lastSeenLocation,
      district: district || prev.district
    }));
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeletePin('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deletePin) return;
    setIsDeleting(true);
    try {
      await deleteWithPin('people', itemToDelete, deletePin);
      setShowDeleteModal(false);
      setItemToDelete(null);
      alert('Report deleted successfully.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (person: Person) => {
    setEditingPersonId(person.id);
    setReportForm({
      name: person.name,
      age: person.age.toString(),
      gender: person.gender,
      district: person.district,
      lastSeenLocation: person.lastSeenLocation,
      lastSeenDate: person.lastSeenDate || '',
      coordinates: person.coordinates,
      physicalDescription: person.physicalDescription || '',
      image: person.image || '',
      reporterName: person.reporterName,
      reporterContact: person.reporterContact,
      message: person.message || '',
      disclaimerChecked: true, // Auto-check for edit
      secretPin: '' // User must re-enter PIN
    });
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.finderTitle}</h1>
          <p className="text-gray-500 mb-2">{t.finderSub}</p>
          <div className="flex gap-3 text-sm">
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1">
              <AlertCircle size={14} />
              {people.filter(p => p.status === 'MISSING').length} Missing
            </span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {t.searchTab}
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Plus size={18} />
            {t.markSafeTab}
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile View Toggle */}
          <div className="lg:hidden flex bg-gray-100 p-1 rounded-lg mb-4 self-start">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              <Filter size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              <MapPin size={14} />
              Map
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Sidebar List */}
            <div className={`lg:col-span-5 flex flex-col gap-4 min-h-0 ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
              {/* Enhanced Search & Filters */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>



                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors w-full justify-between px-1"
                >
                  <span className="flex items-center gap-2">
                    <Filter size={16} />
                    Advanced Filters
                  </span>
                  {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Collapsible Filters */}
                {showAdvancedFilters && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">District</label>
                      <select
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="ALL">All Districts</option>
                        {Object.values(District).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Results List - Grid Layout for Desktop */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-3">
                  {filteredPeople.map((person) => (
                    <div key={person.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group relative">
                      {localStorage.getItem('lankarelief_my_posts')?.includes(person.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(person.id); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {localStorage.getItem('lankarelief_my_posts')?.includes(person.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(person); }}
                          className="absolute top-2 right-10 p-1.5 bg-blue-100 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Edit Report"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                      )}
                      <div
                        className="flex gap-3 items-start cursor-pointer"
                        onClick={() => person.coordinates && setFocusedLocation(person.coordinates)}
                      >
                        {/* Avatar / Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${person.status === 'SAFE'
                          ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
                          : 'bg-gradient-to-br from-red-100 to-red-200 text-red-600'
                          }`}>
                          {person.status === 'SAFE' ? <UserCheck size={20} /> : <AlertCircle size={20} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-base text-gray-900 truncate pr-2">{person.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${person.status === 'SAFE'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                              {person.status || 'MISSING'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 font-medium">Age:</span>
                              <span className="font-medium text-gray-800">{person.age || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 font-medium">Gender:</span>
                              <span className="font-medium text-gray-800">{t[person.gender.toLowerCase() as keyof typeof t] || person.gender}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg">
                            <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 block truncate">{person.lastSeenLocation}</span>
                              <span className="text-[10px] text-gray-500">{person.district}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredPeople.length === 0 && (
                  <div className="text-center py-16 px-6 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                      We couldn't find anyone matching your search. Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('ALL');
                        setFilterDistrict('ALL');
                      }}
                      className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Map View */}
            <div className={`lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[500px] lg:h-full ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
              <ReliefMap items={filteredPeople} height="100%" legendMode="person" focusedLocation={focusedLocation} />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-y-auto">
          {/* Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-red-800">IMPORTANT</h3>
                <p className="text-sm text-red-700 mt-1">{t.warning}</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertCircle size={24} />
            </div>
            {t.markSafeTitle}
          </h2>

          {editingPersonId && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-blue-800">Editing Report</h3>
                <p className="text-sm text-blue-600">You are updating details for this person.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPersonId(null);
                  resetForm();
                  setActiveTab('search');
                }}
                className="text-sm text-blue-700 hover:underline"
              >
                Cancel Edit
              </button>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-8">

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">{t.disclaimerTitle}</h4>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {t.disclaimerText}
                  </p>
                </div>
              </div>
            </div>
            {/* Missing Person Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Missing Person Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName} *</label>
                  <input
                    required
                    value={reportForm.name}
                    onChange={e => setReportForm({ ...reportForm, name: e.target.value })}
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.age}</label>
                  <input
                    value={reportForm.age}
                    onChange={e => setReportForm({ ...reportForm, age: e.target.value })}
                    type="number"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.gender}</label>
                  <select
                    value={reportForm.gender}
                    onChange={e => setReportForm({ ...reportForm, gender: e.target.value as any })}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastSeenDate}</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={reportForm.lastSeenDate}
                    onChange={e => setReportForm({ ...reportForm, lastSeenDate: e.target.value })}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>



                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.physicalDescription}</label>
                  <textarea
                    value={reportForm.physicalDescription}
                    onChange={e => setReportForm({ ...reportForm, physicalDescription: e.target.value })}
                    rows={2}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Height, clothing, distinctive marks..."
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleImproveDescription}
                      disabled={isImproving || !reportForm.physicalDescription.trim()}
                      className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                    >
                      {isImproving ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Refine with AI
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Last Seen Location</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectOnMap}</label>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
                  <select
                    value={reportForm.district}
                    onChange={e => setReportForm({ ...reportForm, district: e.target.value as District })}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.values(District).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastSeenLocation} (City/Town)</label>
                  <input
                    required
                    value={reportForm.lastSeenLocation}
                    onChange={e => setReportForm({ ...reportForm, lastSeenLocation: e.target.value })}
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Colombo 03"
                  />
                </div>
              </div>
            </section>

            {/* Reporter Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t.reporterDetails}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.reporterName} *</label>
                  <input
                    required
                    value={reportForm.reporterName}
                    onChange={e => setReportForm({ ...reportForm, reporterName: e.target.value })}
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.reporterContact} *</label>
                  <input
                    required
                    value={reportForm.reporterContact}
                    onChange={e => setReportForm({ ...reportForm, reporterContact: e.target.value })}
                    type="tel"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.message}</label>
                  <textarea
                    value={reportForm.message}
                    onChange={e => setReportForm({ ...reportForm, message: e.target.value })}
                    rows={2}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Any other relevant information..."
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Secret PIN */}
            <section className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Security
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret PIN (4-digits)</label>
                <input
                  required
                  type="text"
                  maxLength={4}
                  pattern="\d{4}"
                  value={reportForm.secretPin}
                  onChange={e => setReportForm({ ...reportForm, secretPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono tracking-widest text-center"
                  placeholder="0000"
                />
                <p className="text-xs text-gray-500 mt-1">Required to delete/manage this report later.</p>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportForm.disclaimerChecked}
                  onChange={e => setReportForm({ ...reportForm, disclaimerChecked: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {t.disclaimer}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!reportForm.disclaimerChecked}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </span>
                ) : (
                  editingPersonId ? "Update Report" : t.markSafeBtn
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-xl mb-2 text-gray-900">Delete Report</h3>
              <p className="text-gray-500 mb-4">Enter your 4-digit PIN to confirm deletion.</p>

              <input
                type="password"
                maxLength={4}
                value={deletePin}
                onChange={(e) => setDeletePin(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-2xl font-bold tracking-widest mb-6 focus:border-red-500 outline-none"
                placeholder="••••"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting || deletePin.length !== 4}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};