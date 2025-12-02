import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { VolunteerRegistration } from '../components/Volunteer/VolunteerRegistration';
import { ReliefMap } from '../components/Map/ReliefMap';
import { Hand, MapPin, Phone, Briefcase, PlusCircle, AlertCircle, Users, Clock, Shield, Heart, User, Calendar, Megaphone, Trash2, Loader2, Truck } from 'lucide-react';
import { ServiceCategory, NeedStatus, District, Coordinates, ServiceRequest } from '../types';

import { RequestHelpForm } from '../components/RequestHelpForm';

export const Volunteers: React.FC = () => {
  const { volunteers, serviceRequests, deleteWithPin } = useApp();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<'volunteer' | 'recipient'>('volunteer');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showNeedsOnMap, setShowNeedsOnMap] = useState(true);
  const [selectedMission, setSelectedMission] = useState<ServiceRequest | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  // Filter Service Requests
  const activeMissions = serviceRequests.filter(req => {
    const isPending = req.status === 'PENDING' || req.status === 'IN_PROGRESS';
    const matchesDistrict = filterDistrict === 'All' || req.location.district === filterDistrict;
    const matchesType = filterType === 'All' || req.category === filterType;
    return isPending && matchesDistrict && matchesType;
  });



  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeletePin('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deletePin) return;
    setIsDeleting(true);
    try {
      await deleteWithPin('service_requests', itemToDelete, deletePin);
      setShowDeleteModal(false);
      setItemToDelete(null);
      alert('Mission deleted successfully.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };



  const getMissionIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'MEDICAL': return <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Heart size={20} /></div>;
      case 'RESCUE': return <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={20} /></div>;
      case 'CLEANUP': return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={20} /></div>;
      case 'EVACUATION': return <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Truck size={20} /></div>;
      default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Hand size={20} /></div>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header & Toggle */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.volHeroTitle}</h1>
        <p className="text-gray-500 mb-8">{t.volHeroSub}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setViewMode('volunteer')}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${viewMode === 'volunteer'
              ? 'border-green-600 bg-green-50 text-green-700 shadow-md ring-2 ring-green-100'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50 text-gray-600'
              }`}
          >
            <div className={`p-4 rounded-full ${viewMode === 'volunteer' ? 'bg-green-200' : 'bg-gray-100'}`}>
              <Hand size={32} className={viewMode === 'volunteer' ? 'fill-green-600 text-green-600' : 'text-gray-400'} />
            </div>
            <span className="text-lg font-bold">{t.joinNow}</span>
          </button>

          <button
            onClick={() => setViewMode('recipient')}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${viewMode === 'recipient'
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-gray-600'
              }`}
          >
            <div className={`p-4 rounded-full ${viewMode === 'recipient' ? 'bg-blue-200' : 'bg-gray-100'}`}>
              <Megaphone size={32} className={viewMode === 'recipient' ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <span className="text-lg font-bold">{t.requestService}</span>
          </button>
        </div>
      </div>

      {/* VOLUNTEER VIEW */}
      {viewMode === 'volunteer' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to make a difference?</h2>
                <p className="text-green-100 max-w-lg">
                  Join our verified volunteer force. Your skills can save lives.
                </p>
              </div>
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-white text-green-700 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                {t.volRegistration}
              </button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Hand size={200} />
            </div>
          </div>

          {/* Top Section: Map & Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Active Map */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{t.activeMap}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">{t.showNeeds}</span>
                    <button
                      onClick={() => setShowNeedsOnMap(!showNeedsOnMap)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showNeedsOnMap ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showNeedsOnMap ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
                <ReliefMap
                  items={showNeedsOnMap ? [...volunteers, ...activeMissions] : volunteers}
                  height="400px"
                  legendMode="volunteer"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Volunteer Directory */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t.volDirectory}</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {volunteers.map(volunteer => (
                    <div key={volunteer.id} className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                          {volunteer.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${volunteer.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{volunteer.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${volunteer.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {volunteer.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate">{volunteer.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Active Missions List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="text-red-500" />
                Active Missions
              </h3>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">{t.allDistricts}</option>
                  {Object.values(District).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">{t.allTypes}</option>
                  {[
                    { id: 'RESCUE', label: t.reqCatRescue },
                    { id: 'MEDICAL', label: t.reqCatMedical },
                    { id: 'EVACUATION', label: t.reqCatEvacuation },
                    { id: 'CLEANUP', label: t.reqCatCleanup },
                    { id: 'OTHER', label: t.reqCatOther }
                  ].map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions.length > 0 ? (

                activeMissions.map(mission => (
                  <div key={mission.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50/50 flex flex-col h-full relative group">
                    {localStorage.getItem('lankarelief_my_posts')?.includes(mission.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(mission.id); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Delete Mission"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {getMissionIcon(mission.category)}
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">
                            {mission.category === 'RESCUE' ? t.reqCatRescue :
                              mission.category === 'MEDICAL' ? t.reqCatMedical :
                                mission.category === 'EVACUATION' ? t.reqCatEvacuation :
                                  mission.category === 'CLEANUP' ? t.reqCatCleanup : t.reqCatOther}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> {new Date(mission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {(mission.details.urgency === 'CRITICAL' || mission.details.waterLevel === 'EXTREME') && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-3 flex-1 space-y-1">
                      {mission.category === 'RESCUE' && (
                        <>
                          <p><span className="font-semibold">{t.waterLevel}:</span> {mission.details.waterLevel}</p>
                          <p><span className="font-semibold">{t.peopleCount}:</span> {Object.values(mission.details.peopleCount || {}).reduce((a: number, b: number) => a + b, 0)}</p>
                        </>
                      )}
                      {mission.category === 'MEDICAL' && (
                        <>
                          <p><span className="font-semibold">{t.condition}:</span> {mission.details.condition}</p>
                          <p><span className="font-semibold">{t.ambulance}:</span> {mission.details.ambulanceNeeded ? 'Yes' : 'No'}</p>
                        </>
                      )}
                      {mission.category === 'CLEANUP' && (
                        <p><span className="font-semibold">{t.taskType}:</span> {mission.details.taskType}</p>
                      )}
                      {(mission.category === 'EVACUATION' || mission.category === 'OTHER') && (
                        <p className="line-clamp-2">{mission.details.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3 mt-auto">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        <span className="truncate max-w-[100px]" title={mission.location.address}>{mission.location.district}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <Users size={14} />
                        <span>{mission.category === 'CLEANUP' ? mission.details.peopleNeeded : 'Help'} Needed</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMission(mission)}
                      className="w-full mt-3 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      View Details & Contact
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No active service requests at the moment.</p>
                </div>
              )
              }
            </div>
          </div>
        </div>
      )}

      {/* RECIPIENT VIEW */}
      {viewMode === 'recipient' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <RequestHelpForm />
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button
              onClick={() => setShowRegistration(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.volRegistration}</h2>
            <VolunteerRegistration onClose={() => setShowRegistration(false)} />
          </div>
        </div>
      )}

      {/* Mission Details Modal */}
      {selectedMission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button
              onClick={() => setSelectedMission(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getMissionIcon(selectedMission.category)}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMission.category === 'RESCUE' ? t.reqCatRescue :
                    selectedMission.category === 'MEDICAL' ? t.reqCatMedical :
                      selectedMission.category === 'EVACUATION' ? t.reqCatEvacuation :
                        selectedMission.category === 'CLEANUP' ? t.reqCatCleanup : t.reqCatOther}
                </h2>
                {(selectedMission.details.urgency === 'CRITICAL' || selectedMission.details.waterLevel === 'EXTREME') && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">URGENT</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 space-y-2">
                {selectedMission.category === 'RESCUE' && (
                  <>
                    <p><strong>{t.waterLevel}:</strong> {selectedMission.details.waterLevel}</p>
                    <p><strong>{t.buildingType}:</strong> {selectedMission.details.buildingType}</p>
                    <p><strong>{t.floorLevel}:</strong> {selectedMission.details.floorLevel}</p>
                    <p><strong>{t.safeFor}:</strong> {selectedMission.details.safeForHours} hours</p>
                    <p><strong>{t.battery}:</strong> {selectedMission.details.phoneBattery}%</p>
                    <div className="mt-2">
                      <strong>{t.peopleCount}:</strong>
                      <ul className="list-disc list-inside pl-2 mt-1">
                        <li>{t.men}: {selectedMission.details.peopleCount?.men}</li>
                        <li>{t.women}: {selectedMission.details.peopleCount?.women}</li>
                        <li>{t.children}: {selectedMission.details.peopleCount?.children}</li>
                        <li>{t.elderly}: {selectedMission.details.peopleCount?.elderly}</li>
                      </ul>
                    </div>
                  </>
                )}
                {selectedMission.category === 'MEDICAL' && (
                  <>
                    <p><strong>{t.urgencyLevel}:</strong> {selectedMission.details.urgency}</p>
                    <p><strong>{t.condition}:</strong> {selectedMission.details.condition}</p>
                    <p><strong>{t.ambulance}:</strong> {selectedMission.details.ambulanceNeeded ? 'Yes' : 'No'}</p>
                  </>
                )}
                {selectedMission.category === 'CLEANUP' && (
                  <>
                    <p><strong>{t.taskType}:</strong> {selectedMission.details.taskType}</p>
                    <p><strong>{t.peopleNeeded}:</strong> {selectedMission.details.peopleNeeded}</p>
                  </>
                )}
                {(selectedMission.category === 'EVACUATION' || selectedMission.category === 'OTHER') && (
                  <>
                    <p><strong>{t.description}:</strong> {selectedMission.details.description}</p>
                    <p><strong>{t.headcount}:</strong> {selectedMission.details.headcount}</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{t.reqLocation}</p>
                    <p className="text-xs">{selectedMission.location.address}, {selectedMission.location.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">{t.reqContact}</p>
                    <p className="text-xs">{selectedMission.contact.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-xs">{new Date(selectedMission.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${selectedMission.contact.phone}`}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 mt-4"
              >
                <Phone size={18} />
                Call Now: {selectedMission.contact.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-xl mb-2 text-gray-900">Delete Mission</h3>
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
      )}

    </div>
  );
};