import React, { useState, useEffect } from 'react';
import { createReliefRequest } from '../../network/reliefService';
import { fetchBranches } from '../../network/branchService';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { getAutofillData } from '../../network/autofillService';
import { searchGnuid, GNUIDData } from '../../network/gnuidService';

import {
    AlertCircle,
    CheckCircle2,
    Search,
    Camera,
    X,
    ChevronLeft,
    ChevronDown,
    Upload,
    Calendar,
    Home,
    User,
    MapPin,
    CreditCard,
    Phone,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Branch {
    bank_name: string;
    branch_name: string;
}

interface CitizenData {
    name?: string;
    phone?: string;
    address?: string;
    gnDivision?: string;
    dsDivision?: string;
    district?: string;
}

const ReliefEntry: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        nic: '',
        fullName: '',
        phone: '',
        address: '',
        gnId: '',
        gnDivision: '',
        dsDivision: '',
        district: user?.district || '',
        householdId: '',
        censusBlock: '',
        censusUnit: '',
        incidentType: '',
        startDate: '',
        endDate: '',
        ownershipStatus: '',
        isEstate: false,
        damageZone: '',
        damageSeverity: '',
        reliefAmount: '',
        bankName: '',
        branchName: '',
        accountHolder: '',
        accountNumber: '',
        accountNic: '',
        remarks: '',
        evidence: [] as File[],
        dataEnteredBy: user?.id || '',
        assignedVolunteerId: user?.id || ''
    });

    const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [autoFillMessage, setAutoFillMessage] = useState('');
    const [message, setMessage] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);

    // GNUID Autocomplete state
    const [gnuidSuggestions, setGnuidSuggestions] = useState<GNUIDData[]>([]);
    const [isSearchingGnuid, setIsSearchingGnuid] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load branches on component mount with proper error handling
    useEffect(() => {
        const loadBranches = async () => {
            setIsLoadingBranches(true);
            try {
                const data = await fetchBranches();
                console.log('Received branches data:', data);
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    console.log('Branches is already an array:', data.length);
                    setBranches(data);
                } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
                    // Handle case where API returns { data: [...] }
                    console.log('Branches extracted from data property:', data.data.length);
                    setBranches(data.data);
                } else {
                    console.warn('Branches data is not an array:', data);
                    setBranches([]);
                }
            } catch (err) {
                console.error('Failed to fetch branches:', err);
                setBranches([]);
                // Optionally show user-friendly error
                setError('Failed to load bank branches. Please try again.');
            } finally {
                setIsLoadingBranches(false);
            }
        };
        loadBranches();
    }, []);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            evidencePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [evidencePreviews]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSelect = (name: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGnuidSearch = async (query: string) => {
        setFormData(prev => ({ ...prev, gnId: query }));

        if (query.length < 2) {
            setGnuidSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearchingGnuid(true);
        try {
            const data = await searchGnuid(query);
            setGnuidSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch (err) {
            console.error('Failed to fetch GNUID suggestions:', err);
        } finally {
            setIsSearchingGnuid(false);
        }
    };

    const handleSelectGnuid = (item: GNUIDData) => {
        setFormData(prev => ({
            ...prev,
            gnId: item.gnUid,
            gnDivision: item.gnDivision,
            dsDivision: item.dsDivision,
            district: item.district || prev.district
        }));
        setShowSuggestions(false);
    };

    const handleAutoFill = async () => {
        if (!formData.nic.trim()) {
            setAutoFillMessage('Please enter a NIC number first.');
            return;
        }

        setIsAutoFilling(true);
        setAutoFillMessage('');
        setError('');

        try {
            const response = await getAutofillData(formData.nic);
            const citizen = response?.data as CitizenData;

            if (citizen) {
                setFormData(prev => ({
                    ...prev,
                    fullName: citizen.name || prev.fullName,
                    phone: citizen.phone || prev.phone,
                    address: citizen.address || prev.address,
                    gnDivision: citizen.gnDivision || prev.gnDivision,
                    dsDivision: citizen.dsDivision || prev.dsDivision,
                    district: citizen.district || prev.district
                }));
                setAutoFillMessage('✓ Data found successfully');
            } else {
                setAutoFillMessage('No data found for this NIC');
            }
        } catch (error: any) {
            console.error('Auto-fill error:', error);
            if (error?.response?.status === 404) {
                setAutoFillMessage('No data found for this NIC');
                setError('Citizen data not found. Please fill manually.');
            } else {
                setAutoFillMessage('Error searching database');
                setError('Failed to fetch data. Please enter manually.');
            }
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            // Check file types
            const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
            if (invalidFiles.length > 0) {
                setError('Please upload only image files');
                return;
            }

            // Check file sizes (max 5MB each)
            const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                setError('Each image must be less than 5MB');
                return;
            }

            // Limit to 2 files total
            if (formData.evidence.length + files.length > 2) {
                setError('Maximum 2 photos allowed');
                return;
            }

            setFormData(prev => ({
                ...prev,
                evidence: [...prev.evidence, ...files]
            }));

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setEvidencePreviews(prev => [...prev, ...newPreviews]);
            setError('');
        }
    };

    const removeEvidence = (index: number) => {
        setFormData(prev => ({
            ...prev,
            evidence: prev.evidence.filter((_, i) => i !== index)
        }));

        // Clean up the object URL
        URL.revokeObjectURL(evidencePreviews[index]);
        setEvidencePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        if (formData.evidence.length < 2) {
            setError('Please upload at least 2 evidence photos');
            return false;
        }

        if (!formData.nic.trim()) {
            setError('NIC number is required');
            return false;
        }

        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return false;
        }

        if (!formData.incidentType) {
            setError('Please select an incident type');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setMessage('');
        setError('');
        setLoading(true);

        try {
            await createReliefRequest(formData);
            setMessage('✓ Relief application submitted successfully!');

            // Clean up previews
            evidencePreviews.forEach(url => URL.revokeObjectURL(url));

            // Reset form
            setFormData({
                nic: '',
                fullName: '',
                phone: '',
                address: '',
                gnId: '',
                gnDivision: '',
                dsDivision: '',
                district: user?.district || '',
                householdId: '',
                censusBlock: '',
                censusUnit: '',
                incidentType: '',
                startDate: '',
                endDate: '',
                ownershipStatus: '',
                isEstate: false,
                damageZone: '',
                damageSeverity: '',
                reliefAmount: '',
                bankName: '',
                branchName: '',
                accountHolder: '',
                accountNumber: '',
                accountNic: '',
                remarks: '',
                evidence: [],
                dataEnteredBy: user?.id || '',
                assignedVolunteerId: user?.id || ''
            });
            setEvidencePreviews([]);

            // Clear success message after 5 seconds
            setTimeout(() => setMessage(''), 5000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Safely get unique bank names with null check
    const getUniqueBanks = (): string[] => {
        if (!Array.isArray(branches) || branches.length === 0) {
            return [];
        }
        return [...new Set(branches.map(b => b?.bank_name).filter(Boolean))].sort();
    };

    // Safely get filtered branches for selected bank
    const getFilteredBranches = (): Branch[] => {
        if (!Array.isArray(branches) || !formData.bankName) {
            return [];
        }
        return branches.filter(b => b?.bank_name === formData.bankName);
    };

    const uniqueBanks = getUniqueBanks();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 px-4 py-3 bg-white border-b border-gray-200 shadow-sm sm:px-6 sm:py-4">
                <div className="flex items-center gap-3 mx-auto max-w-7xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            New Relief Application
                        </h1>
                        <p className="text-sm text-gray-500">
                            Enter relief request details
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Evidence Section */}
                    <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                            <Camera className="w-5 h-5 text-blue-600" />
                            Evidence Photos
                            {formData.evidence.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({formData.evidence.length}/2)
                                </span>
                            )}
                        </h2>

                        <div className="p-6 transition-colors border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleFileChange}
                                className="hidden"
                                id="evidence-upload"
                            />

                            {evidencePreviews.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {evidencePreviews.map((src, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={src}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="object-cover w-full h-full border border-gray-200 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeEvidence(index)}
                                                    className="absolute p-1 text-white transition-opacity bg-red-600 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-red-700"
                                                    aria-label="Remove image"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.evidence.length < 2 && (
                                            <label
                                                htmlFor="evidence-upload"
                                                className="flex flex-col items-center justify-center gap-2 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer aspect-square hover:bg-gray-100 bg-gray-50"
                                            >
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                <span className="text-xs text-gray-600">Add Photo</span>
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formData.evidence.length} of 2 photos uploaded
                                    </p>
                                </div>
                            ) : (
                                <label
                                    htmlFor="evidence-upload"
                                    className="flex flex-col items-center justify-center py-8 cursor-pointer"
                                >
                                    <div className="p-3 mb-3 bg-blue-100 rounded-full">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="mb-1 text-sm font-medium text-gray-900">
                                        Upload Evidence Photos
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Click to browse (2 photos required)
                                    </p>
                                    <p className="mt-2 text-xs text-gray-400">
                                        JPG or PNG, max 5MB each
                                    </p>
                                </label>
                            )}
                        </div>

                        {formData.evidence.length < 2 && formData.evidence.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-3 mt-3 text-sm rounded-lg bg-amber-50 text-amber-800">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Please upload {2 - formData.evidence.length} more photo{2 - formData.evidence.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </section>

                    {/* Main Form Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Left Column - Applicant Details */}
                        <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Applicant Details
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleAutoFill}
                                        disabled={isAutoFilling}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAutoFilling ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                        {isAutoFilling ? 'Searching...' : 'Auto-fill'}
                                    </button>
                                    {autoFillMessage && (
                                        <span className={`text-sm ${autoFillMessage.includes('✓')
                                            ? 'text-green-600'
                                            : 'text-amber-600'
                                            }`}>
                                            {autoFillMessage}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* GNUID */}
                                <div className="relative">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        GNUID (Grama Niladhari Unique ID)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="gnId"
                                            value={formData.gnId}
                                            onChange={(e) => handleGnuidSearch(e.target.value)}
                                            onFocus={() => formData.gnId.length >= 2 && setShowSuggestions(true)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter GN UID or Number"
                                            autoComplete="off"
                                        />
                                        {isSearchingGnuid && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && gnuidSuggestions.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {gnuidSuggestions.map((item) => (
                                                <button
                                                    key={item.gnUid}
                                                    type="button"
                                                    onClick={() => handleSelectGnuid(item)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.gnDivision}</p>
                                                            <p className="text-xs text-gray-500">{item.dsDivision}, {item.district}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-semibold text-blue-600">{item.gnUid}</p>
                                                            <p className="text-[10px] text-gray-400">#{item.gnNumber}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* GN & DS Division */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            GN Division
                                        </label>
                                        <input
                                            type="text"
                                            name="gnDivision"
                                            value={formData.gnDivision}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="GN Division"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            DS Division
                                        </label>
                                        <input
                                            type="text"
                                            name="dsDivision"
                                            value={formData.dsDivision}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="DS Division"
                                        />
                                    </div>
                                </div>

                                {/* Household ID */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Household ID
                                    </label>
                                    <input
                                        type="text"
                                        name="householdId"
                                        value={formData.householdId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Household ID"
                                    />
                                </div>

                                {/* NIC */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        NIC Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nic"
                                        value={formData.nic}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 123456789V"
                                        required
                                    />
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="As per NIC"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="07XXXXXXXX"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Incident Location
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Full residential address"
                                        />
                                    </div>
                                </div>

                                {/* Census Block & Unit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Census Block
                                        </label>
                                        <input
                                            type="text"
                                            name="censusBlock"
                                            value={formData.censusBlock}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Block No."
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Census Unit
                                        </label>
                                        <input
                                            type="text"
                                            name="censusUnit"
                                            value={formData.censusUnit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Unit No."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Disaster & Damage */}
                            <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                                    <Home className="w-5 h-5 text-blue-600" />
                                    Disaster & Damage
                                </h2>

                                <div className="space-y-4">
                                    {/* Incident Type & Ownership */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Incident Type <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="incidentType"
                                                    value={formData.incidentType}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Flood">Flood</option>
                                                    <option value="Landslide">Landslide</option>
                                                    <option value="Fire">Fire</option>
                                                    <option value="Cyclone">Cyclone</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Ownership
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Owner', 'Tenant', 'Estate', 'Other'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => handleSelect('ownershipStatus', status)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${formData.ownershipStatus === status
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Damage Zone */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Damage Zone
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Kitchen', 'House', 'Other'].map((zone) => (
                                                <button
                                                    key={zone}
                                                    type="button"
                                                    onClick={() => handleSelect('damageZone', zone)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${formData.damageZone === zone
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {zone}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Damage Severity - Only visible when House is selected */}
                                    {formData.damageZone === 'House' && (
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Severity
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Partial', 'Full'].map((severity) => (
                                                    <button
                                                        key={severity}
                                                        type="button"
                                                        onClick={() => handleSelect('damageSeverity', severity)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${formData.damageSeverity === severity
                                                            ? severity === 'Partial'
                                                                ? 'bg-amber-600 text-white border-amber-600'
                                                                : 'bg-red-600 text-white border-red-600'
                                                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {severity}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Relief Amount & Date */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Amount (LKR)
                                            </label>
                                            <div className="relative mb-2">
                                                <span className="absolute text-sm font-medium text-gray-400 transform -translate-y-1/2 left-3 top-1/2">
                                                    Rs.
                                                </span>
                                                <input
                                                    type="number"
                                                    name="reliefAmount"
                                                    value={formData.reliefAmount}
                                                    onChange={handleChange}
                                                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="25000"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['15000', '25000', '50000'].map((amount) => (
                                                    <button
                                                        key={amount}
                                                        type="button"
                                                        onClick={() => handleSelect('reliefAmount', amount)}
                                                        className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors ${formData.reliefAmount === amount
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {Number(amount).toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Start Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                                    <input
                                                        type="date"
                                                        name="startDate"
                                                        value={formData.startDate}
                                                        onChange={handleChange}
                                                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        max={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    End Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                                    <input
                                                        type="date"
                                                        name="endDate"
                                                        value={formData.endDate}
                                                        onChange={handleChange}
                                                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        min={formData.startDate}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Banking Details */}
                            <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Banking Details
                                </h2>

                                {isLoadingBranches ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Bank & Branch */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Bank Name
                                                </label>
                                                <div className="relative">
                                                    {isLoadingBranches ? (
                                                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 flex items-center gap-2 text-gray-500">
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Loading banks...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <select
                                                                name="bankName"
                                                                value={formData.bankName}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select Bank</option>
                                                                {uniqueBanks.length === 0 ? (
                                                                    <option disabled>No banks available</option>
                                                                ) : (
                                                                    uniqueBanks.map(bank => (
                                                                        <option key={bank} value={bank}>{bank}</option>
                                                                    ))
                                                                )}
                                                            </select>
                                                            <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Branch
                                                </label>
                                                <div className="relative">
                                                    {isLoadingBranches ? (
                                                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 flex items-center gap-2 text-gray-500">
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Loading branches...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <select
                                                                name="branchName"
                                                                value={formData.branchName}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                                disabled={!formData.bankName}
                                                            >
                                                                <option value="">Select Branch</option>
                                                                {!formData.bankName ? (
                                                                    <option disabled>Select a bank first</option>
                                                                ) : getFilteredBranches().length === 0 ? (
                                                                    <option disabled>No branches available</option>
                                                                ) : (
                                                                    getFilteredBranches().map(branch => (
                                                                        <option key={`${branch.bank_name}-${branch.branch_name}`} value={branch.branch_name}>
                                                                            {branch.branch_name}
                                                                        </option>
                                                                    ))
                                                                )}
                                                            </select>
                                                            <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Holder */}
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Account Holder Name
                                            </label>
                                            <input
                                                type="text"
                                                name="accountHolder"
                                                value={formData.accountHolder}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Full name as per bank"
                                            />
                                        </div>

                                        {/* Account NIC & Number */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Account Holder NIC
                                                </label>
                                                <input
                                                    type="text"
                                                    name="accountNic"
                                                    value={formData.accountNic}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="NIC linked to account"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="accountNumber"
                                                    value={formData.accountNumber}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Account number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Remarks */}
                                <div className="mt-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                <p className="mt-3 text-xs italic text-gray-400">
                                    * Information verified during on-site assessment
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || formData.evidence.length < 2}
                            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm sm:w-auto hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Submit Application</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Toast Notifications */}
                {message && (
                    <div className="fixed z-50 flex items-center gap-2 px-4 py-3 text-sm text-white bg-green-600 rounded-lg shadow-lg left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:min-w-[320px] animate-slide-up">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{message}</span>
                        <button
                            onClick={() => setMessage('')}
                            className="p-1 rounded hover:bg-green-700"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="fixed z-50 flex items-center gap-2 px-4 py-3 text-sm text-white bg-red-600 rounded-lg shadow-lg left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:min-w-[320px] animate-slide-up">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button
                            onClick={() => setError('')}
                            className="p-1 rounded hover:bg-red-700"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReliefEntry;