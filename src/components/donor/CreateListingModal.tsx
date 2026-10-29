import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, DietaryTag, StorageCondition } from '../../types';
import { X, Plus, Sparkles, AlertCircle, Clock, MapPin, Package } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'prepared', label: 'Prepared Meals & Catering' },
  { value: 'produce', label: 'Fresh Produce & Fruits' },
  { value: 'bakery', label: 'Bakery & Bread' },
  { value: 'dairy', label: 'Dairy & Eggs' },
  { value: 'packaged', label: 'Packaged & Pantry Goods' },
  { value: 'beverages', label: 'Beverages & Juices' },
];

const DIETARY_OPTIONS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
  { value: 'nut_free', label: 'Nut-Free' },
];

const STORAGE_CONDITIONS: { value: StorageCondition; label: string }[] = [
  { value: 'refrigerated', label: 'Refrigerated (< 40°F / 4°C)' },
  { value: 'frozen', label: 'Frozen (< 0°F / -18°C)' },
  { value: 'ambient', label: 'Room Temperature (Ambient dry)' },
  { value: 'hot_hold', label: 'Hot Hold (> 140°F / 60°C)' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createListing, addToast } = useApp();

  const now = new Date();
  const defaultPrep = now.toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 16);
  const defaultWinStart = new Date(now.getTime() + 1800000).toISOString().slice(0, 16);
  const defaultWinEnd = new Date(now.getTime() + 5 * 3600000).toISOString().slice(0, 16);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('prepared');
  const [quantity, setQuantity] = useState('');
  const [estimatedMeals, setEstimatedMeals] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(15);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('refrigerated');
  const [prepTime, setPrepTime] = useState(defaultPrep);
  const [expiryTime, setExpiryTime] = useState(defaultExpiry);
  const [pickupAddress, setPickupAddress] = useState(currentUser?.organizationDetails?.address || '450 Grand Avenue, Downtown Metro');
  const [pickupWindowStart, setPickupWindowStart] = useState(defaultWinStart);
  const [pickupWindowEnd, setPickupWindowEnd] = useState(defaultWinEnd);
  const [pickupInstructions, setPickupInstructions] = useState('Service Dock B. Ring bell for pantry steward.');
  const [allergenInput, setAllergenInput] = useState('');
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDietaryTag = (tag: DietaryTag) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleQuickFill = (type: 'banquet' | 'bakery' | 'produce') => {
    if (type === 'banquet') {
      setTitle('Roasted Salmon Fillets & Quinoa Rice Pilaf');
      setDescription('Surplus from executive dinner event. Flash-chilled within 90 minutes in food-safe stainless pans. Served with grilled asparagus.');
      setCategory('prepared');
      setQuantity('35 boxed meal trays');
      setEstimatedMeals(35);
      setWeightKg(18);
      setDietaryTags(['gluten_free', 'dairy_free']);
      setStorageCondition('refrigerated');
      setAllergenInput('Fish (Salmon)');
    } else if (type === 'bakery') {
      setTitle('Artisan Brioche Buns & Multigrain Loaves');
      setDescription('Fresh morning bake surplus. Perfect condition, sealed in baker trays.');
      setCategory('bakery');
      setQuantity('40 loaves & 30 buns');
      setEstimatedMeals(45);
      setWeightKg(20);
      setDietaryTags(['vegetarian']);
      setStorageCondition('ambient');
      setAllergenInput('Wheat, Eggs, Butter');
    } else if (type === 'produce') {
      setTitle('Organic Bell Peppers, Carrots & Honeycrisp Apples');
      setDescription('Crisp surplus grocery inventory. Washed, graded, and packed in ventilated crates.');
      setCategory('produce');
      setQuantity('5 crates (~50 kg)');
      setEstimatedMeals(60);
      setWeightKg(50);
      setDietaryTags(['vegan', 'gluten_free', 'kosher']);
      setStorageCondition('ambient');
      setAllergenInput('None');
    }
    setSafetyChecked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quantity.trim()) return;

    if (new Date(expiryTime).getTime() <= Date.now()) {
      addToast(
        'Validation Error',
        'Food Safety Rule: Expiry time must be in the future. Please select a valid future timestamp.',
        'error'
      );
      return;
    }

    const allergensList = allergenInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const expIso = new Date(expiryTime).toISOString();
      await createListing({
        title: title.trim(),
        description: description.trim(),
        category: category.toUpperCase(),
        quantity: quantity.trim(),
        quantity_portions: Number(estimatedMeals) || 10,
        estimatedMeals: Number(estimatedMeals) || 10,
        weight_kg: Number(weightKg) || 5,
        weightKg: Number(weightKg) || 5,
        storage_temp: storageCondition === 'refrigerated' ? 'Refrigerated' : storageCondition === 'frozen' ? 'Frozen' : 'Ambient',
        storageType: storageCondition.toUpperCase() as any,
        prepareTime: new Date(prepTime).toISOString(),
        expiry_timestamp: expIso,
        expiryTime: expIso,
        locationAddress: pickupAddress.trim(),
        neighborhood: currentUser?.organizationDetails?.neighborhood || 'Downtown',
        pickupWindowStart: new Date(pickupWindowStart).toISOString(),
        pickupWindowEnd: new Date(pickupWindowEnd).toISOString(),
        pickupInstructions: pickupInstructions.trim(),
        dietaryTags,
        allergens: allergensList.length > 0 ? allergensList : ['No common allergens declared']
      });
      onClose();
    } catch (err: any) {
      addToast('Failed to create listing', err.message || 'Server error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-listing-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="create-listing-title" className="text-lg font-bold text-slate-900">
              Create Surplus Food Listing
            </h2>
            <p className="text-xs text-slate-500">
              Posting on behalf of <span className="font-semibold text-slate-700">{currentUser?.organizationDetails?.type || currentUser?.name || 'Verified Donor'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick templates helper */}
        <div className="bg-slate-50/80 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Auto-fill demo template:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('banquet')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
            >
              Catering Entree
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('bakery')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
            >
              Bakery Surplus
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('produce')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
            >
              Fresh Produce
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Food Listing Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gourmet Roasted Salmon Fillets with Steamed Rice"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Category & Storage Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Storage Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STORAGE_CONDITIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity, Meals, Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Quantity Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 45 portions / 15 pans"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Estimated Meals Served
              </label>
              <input
                type="number"
                min="1"
                value={estimatedMeals}
                onChange={(e) => setEstimatedMeals(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Food Description & Preparation Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe dishes, ingredients, freshness details, and handling recommendations..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Dietary Information (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((tag) => {
                const isSelected = dietaryTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleDietaryTag(tag.value)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timestamps: Prep, Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Prepared / Packaged Date & Time
              </label>
              <input
                type="datetime-local"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Best Before / Expiry Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pickup Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Pickup Window Starts
              </label>
              <input
                type="datetime-local"
                value={pickupWindowStart}
                onChange={(e) => setPickupWindowStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Pickup Window Ends (Latest Collection)
              </label>
              <input
                type="datetime-local"
                value={pickupWindowEnd}
                onChange={(e) => setPickupWindowEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Address & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Pickup Location Address
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Allergen Disclosure (comma separated)
              </label>
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                placeholder="e.g. Dairy, Wheat, Tree nuts (almonds)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Pickup Dock / Steward Instructions
            </label>
            <input
              type="text"
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g. Ring Bell at Receiving Dock 2, ask for Sous Chef"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Safety Checkbox */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="safety-declaration"
              required
              checked={safetyChecked}
              onChange={(e) => setSafetyChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="safety-declaration" className="text-xs text-emerald-950 leading-relaxed cursor-pointer">
              <span className="font-semibold">Food Safety Compliance Declaration:</span> I confirm this food was prepared and held under strict municipal health and temperature standards, has not been previously served to consumers, and is packaged in food-grade containers.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!safetyChecked}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                safetyChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Publish Food Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
