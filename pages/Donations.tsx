import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { refineNeedDescription } from '../services/geminiService';
import { Need, NeedStatus, District, Coordinates, UrgencyLevel, NeedCategory } from '../types';
import { Filter, CheckCircle, Clock, Package, Sparkles, MapPin, Loader2, Heart, Megaphone, AlertTriangle, Users, Baby, Pill, Shirt, Droplets, Utensils, Map, Share2, MessageCircle, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { LocationPicker } from '../components/Map/LocationPicker';
import { ReliefMap } from '../components/Map/ReliefMap';

export const Donations: React.FC = () => {
  const { needs, addNeed, updateNeedStatus, pledgeToNeed, receiveDonation, reopenNeed, deleteWithPin, updateNeed } = useApp();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<'donor' | 'recipient'>('donor');
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterUrgency, setFilterUrgency] = useState<string>('All');

  // Pledge Modal State
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState<number>(0);
  const [pledgePin, setPledgePin] = useState('');

  // Common Details State
  const [commonDistrict, setCommonDistrict] = useState<District>(District.COLOMBO);
  const [commonLocation, setCommonLocation] = useState('');
  const [commonCoords, setCommonCoords] = useState<Coordinates | undefined>(undefined);
  const [commonName, setCommonName] = useState('');
  const [commonContact, setCommonContact] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState<Coordinates | null>(null);

  // Edit Mode State
  const [editingNeedId, setEditingNeedId] = useState<string | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Item Entry State
  const [newCategory, setNewCategory] = useState<NeedCategory>('FOOD');
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [customItemName, setCustomItemName] = useState('');
  const [demoMen, setDemoMen] = useState<string>('');
  const [demoWomen, setDemoWomen] = useState<string>('');
  const [demoChildren, setDemoChildren] = useState<string>('');
  const [newDescription, setNewDescription] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  // Cart State
  const [cart, setCart] = useState<Partial<Need>[]>([]);

  // Received Modal State
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  const quickAddItems = [
    { category: 'FOOD', item: 'Rice (5kg)', unit: 'Packs' },
    { category: 'WATER', item: 'Water Bottles (1L)', unit: 'Bottles' },
    { category: 'MEDICINE', item: 'Panadol', unit: 'Cards' },
    { category: 'CLOTHING', item: 'T-Shirts', unit: 'Items' },
    { category: 'BABY_ITEMS', item: 'Baby Milk Powder', unit: 'Packs' },
  ];

  const handleQuickAdd = (item: any) => {
    setNewCategory(item.category as NeedCategory);
    setCustomItemName(item.item);
    // Scroll to item details
    document.getElementById('item-details')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceivedClick = (need: Need) => {
    setSelectedNeed(need);
    const remaining = (need.quantity || 0) - (need.receivedAmount || 0);
    setReceivedAmount(remaining > 0 ? remaining : 0);
    setShowReceivedModal(true);
  };

  const handleConfirmReceived = () => {
    if (selectedNeed && receivedAmount > 0) {
      receiveDonation(selectedNeed.id, receivedAmount);
      setShowReceivedModal(false);
      setSelectedNeed(null);
      alert(`Updated received amount: ${receivedAmount}`);
    }
  };

  const handlePledgeClick = (need: Need) => {
    setSelectedNeed(need);
    const remaining = (need.quantity || 0) - (need.pledgedAmount || 0);
    setPledgeAmount(remaining > 0 ? remaining : 0);
    setPledgePin(''); // Always require PIN for security
    setShowPledgeModal(true);
  };

  const handleConfirmPledge = async () => {
    if (selectedNeed && pledgeAmount > 0) {
      if (!pledgePin || pledgePin.length !== 4) {
        alert("Please enter a 4-digit PIN to secure your pledge.");
        return;
      }
      try {
        await pledgeToNeed(selectedNeed.id, pledgeAmount, pledgePin);
        setShowPledgeModal(false);
        setSelectedNeed(null);
        alert(`Thank you! You have pledged to help with ${pledgeAmount} ${selectedNeed.unit || 'items'}.`);
      } catch (error: any) {
        alert("Failed to pledge: " + error.message);
      }
    }
  };

  const handleReopenClick = async (need: Need) => {
    if (confirm("Are you sure you want to re-open this request? This will clear the current pledge.")) {
      try {
        await reopenNeed(need.id);
        alert("Request re-opened successfully.");
      } catch (error: any) {
        alert("Failed to re-open: " + error.message);
      }
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCommonCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          alert('Unable to retrieve location.');
        }
      );
    }
  };

  const handleImproveText = async () => {
    if (!newDescription.trim()) return;
    setIsImproving(true);
    const improved = await refineNeedDescription(customItemName || newCategory, commonLocation, newDescription);
    setNewDescription(improved);
    setIsImproving(false);
  };

  const handleAddToList = () => {
    const menCount = parseInt(demoMen) || 0;
    const womenCount = parseInt(demoWomen) || 0;
    const childrenCount = parseInt(demoChildren) || 0;
    const totalAffected = menCount + womenCount + childrenCount;

    if (totalAffected === 0) {
      alert('Please specify the number of affected people (Men, Women, or Children).');
      return;
    }

    const newItem: Partial<Need> = {
      id: Math.random().toString(36).substr(2, 9),
      item: newCategory === 'OTHER' ? customItemName : t[`cat${newCategory.charAt(0) + newCategory.slice(1).toLowerCase()}` as keyof typeof t],
      category: newCategory,
      urgency: newUrgency,
      affectedCount: totalAffected,
      demographics: {
        men: menCount,
        women: womenCount,
        children: childrenCount
      },
      quantity: totalAffected,
      pledgedAmount: 0,
      unit: 'People',
      description: newDescription,
      status: NeedStatus.REQUESTED,
      createdAt: Date.now(),
    };

    setCart([...cart, newItem]);

    // Reset Item Fields
    setCustomItemName('');
    setDemoMen(''); setDemoWomen(''); setDemoChildren('');
    setNewDescription('');
    setNewUrgency('MEDIUM');
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleEditClick = (need: Need) => {
    setEditingNeedId(need.id);

    // Populate Common Details
    setCommonDistrict(need.district);
    setCommonLocation(need.location);
    setCommonCoords(need.coordinates);
    setCommonName(need.contactName);
    setCommonContact(need.contactNumber);
    setSecretPin(''); // User must re-enter PIN to save changes

    // Populate Item Details (Single item edit for now, as structure is per-item)
    // Since we are editing a single 'Need' document which represents one item
    setCart([need]);

    setViewMode('recipient');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to the list.');
      return;
    }
    if (!commonName || !commonContact || !commonLocation) {
      alert('Please fill in all Common Details (Location, Name, Contact).');
      return;
    }
    if (!secretPin || secretPin.length !== 4) {
      alert('Please enter a 4-digit Secret PIN to secure this request.');
      return;
    }

    try {
      if (editingNeedId) {
        // Update Mode
        // We only support editing the first item in the cart because 'editingNeedId' corresponds to a single document
        const itemToUpdate = cart[0];

        const updateData: Partial<Need> = {
          ...itemToUpdate,
          district: commonDistrict,
          location: commonLocation,
          coordinates: commonCoords,
          contactName: commonName,
          contactNumber: commonContact,
          // secretPin is not updated here for security, or maybe we allow updating it if they provide the old one?
          // For now, let's assume they provide the CURRENT pin to authorize the update.
        };

        await updateNeed(editingNeedId, updateData, secretPin);
        alert('Request updated successfully!');
        setEditingNeedId(null);
      } else {
        // Create Mode
        for (const item of cart) {
          const need: Need = {
            ...item as Need,
            district: commonDistrict,
            location: commonLocation,
            coordinates: commonCoords,
            contactName: commonName,
            contactNumber: commonContact,
            secretPin: secretPin,
          };
          await addNeed(need);
        }
        alert('Request submitted successfully! Save your PIN: ' + secretPin);
      }

      // Reset All
      setCart([]);
      setCommonLocation(''); setCommonName(''); setCommonContact(''); setCommonCoords(undefined); setSecretPin('');
      setViewMode('donor');

    } catch (error: any) {
      alert(error.message);
    }
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
      await deleteWithPin('needs', itemToDelete, deletePin);
      setShowDeleteModal(false);
      setItemToDelete(null);
      alert('Post deleted successfully.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = (need: Need) => {
    const text = `🚨 *URGENT HELP NEEDED* 🚨\n\n*Item:* ${need.item}\n*Location:* ${need.location} (${need.district})\n*Affected:* ${need.affectedCount} people\n*Urgency:* ${need.urgency}\n\nCan you help? Contact: ${need.contactNumber}\n\n#LankaRelief #FloodReliefLK`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredNeeds = needs.filter(n => {
    const matchesDistrict = filterDistrict === 'All' || n.district === filterDistrict;
    const isGoods = n.type !== 'SERVICE'; // Only show GOODS in Donations
    const matchesSearch = searchQuery === '' ||
      n.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || n.category === filterCategory;
    const matchesUrgency = filterUrgency === 'All' || n.urgency === filterUrgency;

    const isMyPost = localStorage.getItem('lankarelief_my_posts')?.includes(n.id);
    const isMyPledge = localStorage.getItem('lankarelief_my_pledges')?.includes(n.id);

    // Visibility Logic:
    // 1. REQUESTED or PARTIALLY_PLEDGED: Visible to everyone
    // 2. FULLY_PLEDGED: Visible to Owner (My Post) and Donor (My Pledge)
    // 3. RECEIVED: Visible to Owner (My Post) and Donor (My Pledge)

    const isVisible =
      n.status === NeedStatus.REQUESTED ||
      n.status === NeedStatus.PARTIALLY_PLEDGED ||
      ((n.status === NeedStatus.FULLY_PLEDGED || n.status === NeedStatus.RECEIVED) && (isMyPost || isMyPledge));

    return matchesDistrict && isGoods && matchesSearch && matchesCategory && matchesUrgency && isVisible;
  });

  const getCategoryIcon = (category: NeedCategory) => {
    switch (category) {
      case 'FOOD': return <Utensils size={18} />;
      case 'MEDICINE': return <Pill size={18} />;
      case 'WATER': return <Droplets size={18} />;
      case 'CLOTHING': return <Shirt size={18} />;
      case 'BABY_ITEMS': return <Baby size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">{t.donationTitle}</h1>
        <p className="text-gray-500 mt-2">{t.donationSub}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setViewMode('donor')}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${viewMode === 'donor'
              ? 'border-green-600 bg-green-50 text-green-700 shadow-md ring-2 ring-green-100'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50 text-gray-600'
              }`}
          >
            <div className={`p-4 rounded-full ${viewMode === 'donor' ? 'bg-green-200' : 'bg-gray-100'}`}>
              <Heart size={32} className={viewMode === 'donor' ? 'fill-green-600 text-green-600' : 'text-gray-400'} />
            </div>
            <span className="text-lg font-bold">{t.modeHelp}</span>
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
            <span className="text-lg font-bold">{t.modeRequest}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        {/* DONOR VIEW */}
        {viewMode === 'donor' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t.modeHelp}</h2>
                  <p className="text-gray-600">{t.donorIntro}</p>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder || "Search needs..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div>

                {/* District Filter */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <Filter size={18} className="text-gray-400" />
                  <select
                    className="bg-transparent text-sm focus:outline-none text-gray-700 w-full"
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                  >
                    <option value="All">{t.filterByDistrict} (All)</option>
                    {Object.values(District).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <Package size={18} className="text-gray-400" />
                  <select
                    className="bg-transparent text-sm focus:outline-none text-gray-700 w-full"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="All">{t.filterByType} (All)</option>
                    {(['FOOD', 'MEDICINE', 'WATER', 'CLOTHING', 'BABY_ITEMS', 'OTHER'] as NeedCategory[]).map(c => (
                      <option key={c} value={c}>{t[`cat${c.charAt(0) + c.slice(1).toLowerCase()}` as keyof typeof t]}</option>
                    ))}
                  </select>
                </div>

                {/* Urgency Filter */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <AlertTriangle size={18} className="text-gray-400" />
                  <select
                    className="bg-transparent text-sm focus:outline-none text-gray-700 w-full"
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                  >
                    <option value="All">{t.urgency} (All)</option>
                    <option value="HIGH">{t.high}</option>
                    <option value="MEDIUM">{t.medium}</option>
                    <option value="LOW">{t.low}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Package size={24} /></div>
                <div>
                  <p className="text-sm text-red-600 font-medium">{t.itemNeeded}</p>
                  <p className="text-2xl font-bold text-gray-900">{needs.filter(n => n.status === NeedStatus.REQUESTED).length}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={24} /></div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pledged</p>
                  <p className="text-2xl font-bold text-gray-900">{needs.filter(n => n.status === NeedStatus.PARTIALLY_PLEDGED || n.status === NeedStatus.FULLY_PLEDGED).length}</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
                <div>
                  <p className="text-sm text-green-600 font-medium">{t.completed}</p>
                  <p className="text-2xl font-bold text-gray-900">{needs.filter(n => n.status === NeedStatus.RECEIVED).length}</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  Needs Map
                </h3>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                  Showing {filteredNeeds.filter(n => n.coordinates).length} locations
                </span>
              </div>
              <ReliefMap items={filteredNeeds} height="400px" legendMode="needs" focusedLocation={focusedLocation} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNeeds.map((need) => {
                const progress = need.quantity && need.quantity > 0 ? ((need.pledgedAmount || 0) / need.quantity) * 100 : 0;
                return (
                  <div
                    key={need.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full ${need.coordinates ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-200' : ''}`}
                    onClick={() => need.coordinates && setFocusedLocation(need.coordinates)}
                  >
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${need.status === NeedStatus.REQUESTED ? 'bg-red-100 text-red-800' :
                              (need.status === NeedStatus.PARTIALLY_PLEDGED || need.status === NeedStatus.FULLY_PLEDGED) ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {need.status}
                            </span>
                            {need.urgency && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(need.urgency)}`}>
                                {t[need.urgency.toLowerCase() as keyof typeof t]}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {need.category && getCategoryIcon(need.category)}
                            {need.category && need.category !== 'OTHER'
                              ? t[`cat${need.category.charAt(0) + need.category.slice(1).toLowerCase()}` as keyof typeof t]
                              : need.item}
                          </h3>
                          {need.demographics ? (
                            <div className="flex gap-3 mt-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1"><Users size={12} /> <b>{need.demographics.men}</b> {t.men}</span>
                              <span className="flex items-center gap-1"><Users size={12} /> <b>{need.demographics.women}</b> {t.women}</span>
                              <span className="flex items-center gap-1"><Baby size={12} /> <b>{need.demographics.children}</b> {t.children}</span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mt-1">{need.quantity} {need.unit}</p>
                          )}
                        </div>
                        <div className="text-right pl-2">
                          <p className="text-sm font-medium text-gray-900">{need.district}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]" title={need.location}>{need.location}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{t.pledgedProgress}</span>
                          <span className="font-medium">{need.pledgedAmount || 0} / {need.quantity}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {need.description && (
                        <div className="mb-4 bg-purple-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-line border border-purple-100">
                          <div className="flex items-center gap-1 text-purple-700 text-xs font-bold mb-1">
                            <Sparkles size={10} /> AI Enhanced Note
                          </div>
                          {need.description}
                        </div>
                      )}

                      <div className="mt-auto space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                        <div className="flex justify-between">
                          <span>Contact:</span>
                          <span className="font-medium text-gray-900">{need.contactName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-medium text-gray-900">{need.contactNumber}</span>
                        </div>
                        {need.coordinates && (
                          <div className="flex justify-between items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <span className="flex items-center gap-1"><MapPin size={12} /> GPS Available</span>
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="p-5 pt-0 flex gap-2">
                      {localStorage.getItem('lankarelief_my_posts')?.includes(need.id) && (
                        <>
                          <button
                            onClick={() => handleDeleteClick(need.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button
                            onClick={() => handleEditClick(need)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Post"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleShare(need)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title={t.share}
                      >
                        <Share2 size={20} />
                      </button>
                      {(need.status === NeedStatus.REQUESTED || need.status === NeedStatus.PARTIALLY_PLEDGED) && !localStorage.getItem('lankarelief_my_posts')?.includes(need.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePledgeClick(need); }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          {localStorage.getItem('lankarelief_my_pledges')?.includes(need.id) ? "Pledge More" : t.pledgeHelp}
                        </button>
                      )}

                      {/* Requester Actions */}
                      {localStorage.getItem('lankarelief_my_posts')?.includes(need.id) && (
                        <>
                          {(need.status === NeedStatus.FULLY_PLEDGED || need.status === NeedStatus.PARTIALLY_PLEDGED) && (
                            <div className="flex flex-col gap-2 w-full">
                              <button
                                onClick={() => handleReceivedClick(need)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                {t.markReceived}
                              </button>
                              {need.pledgedAt && (Date.now() - need.pledgedAt > 48 * 60 * 60 * 1000) && (
                                <button
                                  onClick={() => handleReopenClick(need)}
                                  className="w-full bg-orange-100 text-orange-700 py-2 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                                >
                                  Re-open Request
                                </button>
                              )}
                            </div>
                          )}
                          {need.status === NeedStatus.RECEIVED && (
                            <div className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                              <CheckCircle size={16} /> Completed
                            </div>
                          )}
                        </>
                      )}

                      {/* Donor Actions */}
                      {localStorage.getItem('lankarelief_my_pledges')?.includes(need.id) && (
                        <div className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium text-center border border-blue-100">
                          You Pledged
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredNeeds.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  No needs found matching your filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECIPIENT VIEW (REQUEST CART) */}
        {viewMode === 'recipient' && (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t.postNeed}</h2>
                <p className="text-gray-500">{t.requestIntro}</p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-8">

                {/* 1. Common Details */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} /> {t.commonDetails}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
                      <select value={commonDistrict} onChange={e => setCommonDistrict(e.target.value as District)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        {Object.values(District).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
                      <div className="flex gap-2">
                        <input required type="text" value={commonLocation} onChange={e => setCommonLocation(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="e.g. Town Hall Camp" />
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="p-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm font-medium"
                        >
                          <Map size={18} />
                        </button>
                        <button type="button" onClick={handleGetLocation} className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50" title={t.getLocation}>
                          {isLocating ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} className={commonCoords ? "text-green-600" : ""} />}
                        </button>
                      </div>
                      {commonCoords && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Location coordinates attached.</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactName}</label>
                      <input required type="text" value={commonName} onChange={e => setCommonName(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactPhone}</label>
                      <input required type="text" value={commonContact} onChange={e => setCommonContact(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                  </div>
                </div>

                {/* 2. Item Entry */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={20} /> {t.itemDetails}
                  </h3>

                  {/* Quick Add Buttons */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.quickAdd}</label>
                    <div className="flex flex-wrap gap-2">
                      {quickAddItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickAdd(item)}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <Plus size={12} /> {item.item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category & Urgency */}
                  <div id="item-details" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['FOOD', 'MEDICINE', 'WATER', 'CLOTHING', 'BABY_ITEMS', 'OTHER'] as NeedCategory[]).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewCategory(cat)}
                            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${newCategory === cat
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'
                              }`}
                          >
                            {getCategoryIcon(cat)}
                            <span className="text-[10px] font-medium text-center leading-tight">
                              {t[`cat${cat.charAt(0) + cat.slice(1).toLowerCase()}` as keyof typeof t]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.urgency}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['LOW', 'MEDIUM', 'HIGH'] as UrgencyLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setNewUrgency(level)}
                            className={`p-2 rounded-xl border-2 text-sm font-bold transition-all ${newUrgency === level
                              ? level === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700'
                                : level === 'MEDIUM' ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                              }`}
                          >
                            {t[level.toLowerCase() as keyof typeof t]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {newCategory === 'OTHER' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.itemNeeded}</label>
                      <input type="text" value={customItemName} onChange={e => setCustomItemName(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="Specify item..." />
                    </div>
                  )}

                  {/* Demographics */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.affectedCount}</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.men}</label>
                        <input type="number" min="0" value={demoMen} onChange={e => setDemoMen(e.target.value)} className="w-full border rounded-lg p-2 text-center" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.women}</label>
                        <input type="number" min="0" value={demoWomen} onChange={e => setDemoWomen(e.target.value)} className="w-full border rounded-lg p-2 text-center" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.children}</label>
                        <input type="number" min="0" value={demoChildren} onChange={e => setDemoChildren(e.target.value)} className="w-full border rounded-lg p-2 text-center" placeholder="0" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">{t.description}</label>
                      <button
                        type="button"
                        onClick={handleImproveText}
                        disabled={isImproving || !newDescription}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors"
                      >
                        {isImproving ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {t.aiRefine}
                      </button>
                    </div>
                    <textarea
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                      rows={2}
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      placeholder="Describe the situation..."
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToList}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={20} /> {t.addToList}
                  </button>
                </div>

                {/* 3. Cart List */}
                {cart.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <ShoppingCart size={20} /> {t.yourCart} ({cart.length})
                    </h3>
                    <div className="space-y-3 mb-6">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600">
                              {item.category && getCategoryIcon(item.category)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.item}</p>
                              <p className="text-xs text-gray-500">{item.affectedCount} People ({item.urgency})</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={t.removeItem}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Secret PIN */}
                    <div className="mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
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
                          value={secretPin}
                          onChange={e => setSecretPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono tracking-widest text-center"
                          placeholder="0000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Required to delete/manage these posts later.</p>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300 text-lg">
                      {t.submitRequest}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Pledge Modal */}
        {showPledgeModal && selectedNeed && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-xl mb-2 text-gray-900">{t.pledgeHelp}</h3>
              <p className="text-gray-500 mb-4">
                How much can you contribute towards <b>{selectedNeed.item}</b>?
              </p>

              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Current Progress</span>
                  <span className="font-bold">{selectedNeed.pledgedAmount || 0} / {selectedNeed.quantity}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(((selectedNeed.pledgedAmount || 0) / (selectedNeed.quantity || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">I will provide:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={(selectedNeed.quantity || 0) - (selectedNeed.pledgedAmount || 0)}
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 border-2 border-blue-100 rounded-xl p-3 text-lg font-bold text-center focus:border-blue-500 outline-none"
                  />
                  <div className="flex items-center justify-center bg-gray-100 px-4 rounded-xl font-medium text-gray-600">
                    {selectedNeed.unit || 'Items'}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Secret PIN (4-digits):</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pledgePin}
                  onChange={(e) => setPledgePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-2xl font-bold tracking-widest focus:border-blue-500 outline-none"
                  placeholder="••••"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Needed to manage or cancel your pledge.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPledgeModal(false)}
                  className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmPledge}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Confirm Pledge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Received Modal */}
        {showReceivedModal && selectedNeed && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-xl mb-2 text-gray-900">{t.markReceived}</h3>
              <p className="text-gray-500 mb-4">
                {t.howMuchReceived}
              </p>

              <div className="bg-green-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t.receivedProgress}</span>
                  <span className="font-bold">{selectedNeed.receivedAmount || 0} / {selectedNeed.quantity}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{ width: `${Math.min(((selectedNeed.receivedAmount || 0) / (selectedNeed.quantity || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={(selectedNeed.quantity || 0) - (selectedNeed.receivedAmount || 0)}
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 border-2 border-green-100 rounded-xl p-3 text-lg font-bold text-center focus:border-green-500 outline-none"
                  />
                  <div className="flex items-center justify-center bg-gray-100 px-4 rounded-xl font-medium text-gray-600">
                    {selectedNeed.unit || 'Items'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceivedModal(false)}
                  className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmReceived}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-xl mb-2 text-gray-900">Delete Post</h3>
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


        {/* Map Picker Modal */}
        {
          showMapPicker && (
            <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-4 w-full max-w-lg shadow-2xl">
                <h3 className="font-bold text-lg mb-4">{t.selectOnMap}</h3>
                <LocationPicker
                  onLocationSelect={(coords, address, district) => {
                    setCommonCoords(coords);
                    if (address) setCommonLocation(address);
                    if (district) setCommonDistrict(district);
                  }}
                  initialCoords={commonCoords}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t.confirmLocation}
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};