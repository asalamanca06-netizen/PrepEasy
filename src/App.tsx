/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  ShoppingBag, 
  Clock, 
  PlusCircle, 
  RotateCcw, 
  History, 
  Lightbulb, 
  CheckCircle, 
  ArrowLeft, 
  FolderPlus, 
  Sliders, 
  WifiOff, 
  Wifi, 
  Check, 
  Trash2, 
  Star, 
  TrendingUp, 
  Smile,
  BookOpen, 
  Camera,
  Layers,
  Search
} from 'lucide-react';

import { Ingredient, Recipe, CookedHistory, AppState, ActiveTab, EnergyLevel } from './types';
import { INITIAL_INGREDIENTS, ALL_RECIPES, INITIAL_HISTORY, INGREDIENT_IMAGES, CATEGORY_FALLBACK_IMAGES } from './data';

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [appState, setAppState] = useState<AppState>('connected');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('low');
  
  // Dynamic Data Lists
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(ALL_RECIPES);
  const [history, setHistory] = useState<CookedHistory[]>(INITIAL_HISTORY);
  
  // Custom Controls for Simulation / Screenshots
  const [pantryIsEmpty, setPantryIsEmpty] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Carlos');
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [showSimPanelOnMobile, setShowSimPanelOnMobile] = useState<boolean>(false);
  
  // UI Flow States
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [galleryEnergyFilter, setGalleryEnergyFilter] = useState<'all' | 'low' | 'balanced' | 'disconnect'>('all');
  const [isScanningReceipt, setIsScanningReceipt] = useState<boolean>(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState<boolean>(false);
  const [isChefTipVisible, setIsChefTipVisible] = useState<boolean>(true);
  
  // New entry state
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<'Verduras' | 'Carnes' | 'Lácteos' | 'Granos' | 'Condimentos' | 'Otros'>('Verduras');
  const [newIngExpiry, setNewIngExpiry] = useState<number>(5);
  const [newIngQtyAmount, setNewIngQtyAmount] = useState<number | ''>('');
  const [newIngQtyUnit, setNewIngQtyUnit] = useState<'g' | 'kg' | 'ml' | 'L' | 'unidades'>('g');
  const [ingFormErrors, setIngFormErrors] = useState<{ name?: string; qty?: string }>({});

  // Cooking step tracking
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Avatar photos matching high-quality representations
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Sra / Mujer Prof (Carlos default profile variant)
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', // Carlos (Men smiling)
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', // Young professional
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'  // Business worker
  ];

  // Auto-calculated fields
  const expiringIngredientsCount = ingredients.filter(i => !pantryIsEmpty && i.expirationDays <= 3).length;
  
  // Alarmist Warnings
  const warnings = pantryIsEmpty ? [] : ingredients.filter(i => i.expirationDays <= 1);

  // Handle Kitchen countdown timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const startKitchenTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  // Switch App state for quick evaluation
  const setSkeletonLoading = () => {
    setAppState('loading');
    setTimeout(() => {
      setAppState('connected');
    }, 2000); // Back to normal after 2s
  };

  // Quick reset to empty pantry for test
  const toggleEmptyPantry = () => {
    setPantryIsEmpty(!pantryIsEmpty);
  };

  // Add custom manual ingredient
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; qty?: string } = {};
    if (!newIngName.trim()) errors.name = 'El nombre no puede estar vacío.';
    if (newIngQtyAmount === '' || Number(newIngQtyAmount) <= 0) errors.qty = 'La cantidad debe ser mayor a 0.';
    if (Object.keys(errors).length > 0) { setIngFormErrors(errors); return; }
    const newIng: Ingredient = {
      id: Date.now().toString(),
      name: newIngName.trim(),
      category: newIngCategory,
      expirationDays: newIngExpiry,
      quantity: `${newIngQtyAmount} ${newIngQtyUnit}`,
      isNearingExpiry: newIngExpiry <= 2
    };
    setIngredients([newIng, ...ingredients]);
    setNewIngName('');
    setNewIngQtyAmount('');
    setNewIngQtyUnit('g');
    setIngFormErrors({});
    setShowAddIngredientModal(false);
    setPantryIsEmpty(false);
  };

  // Action: Complete cooking recipe
  const finishCooking = () => {
    if (!activeCookingRecipe) return;
    
    const newHistoryEntry: CookedHistory = {
      id: Date.now().toString(),
      recipeId: activeCookingRecipe.id,
      recipeTitle: activeCookingRecipe.title,
      date: 'Hoy, a las ' + new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
      timeSaved: activeCookingRecipe.prepTime,
      rating: 5
    };

    setHistory([newHistoryEntry, ...history]);
    setActiveCookingRecipe(null);
    setCompletedSteps([]);
    setIsTimerRunning(false);
    
    // Automatically reduce cooking ingredients expirations as part of simulation
    setIngredients(prev => 
      prev.map(i => {
        const matchesUsed = activeCookingRecipe.ingredientsNeeded.some(n => n.name.toLowerCase() === i.name.toLowerCase());
        if (matchesUsed) {
          return { ...i, quantity: 'Consumido' };
        }
        return i;
      }).filter(i => i.quantity !== 'Consumido')
    );

    setActiveTab('historial');
  };

  // Simulating the OCR receipt scan
  const handleReceiptScan = () => {
    setIsScanningReceipt(true);
    setTimeout(() => {
      // Simulate ingredients scanned from Mercadona/Carrefour
      const scanned: Ingredient[] = [
        { id: 'scan_1', name: 'Salmón noruego fresco', category: 'Carnes', expirationDays: 2, quantity: '2 filetes' },
        { id: 'scan_2', name: 'Brócoli rizado', category: 'Verduras', expirationDays: 3, quantity: '1 ud' },
        { id: 'scan_3', name: 'Limones de huerta', category: 'Verduras', expirationDays: 14, quantity: '4 uds' },
        { id: 'scan_4', name: 'Salsa de soja baja en sal', category: 'Condimentos', expirationDays: 120, quantity: '250ml' },
        { id: 'scan_5', name: 'Queso feta griego', category: 'Lácteos', expirationDays: 8, quantity: '200g' }
      ];
      setIngredients(prev => [...scanned, ...prev]);
      setPantryIsEmpty(false);
      setIsScanningReceipt(false);
      setActiveTab('despensa');
    }, 1800);
  };

  // Interactive Recipe Ratings
  const handleSetRating = (historyId: string, value: number) => {
    setHistory(prev => prev.map(item => item.id === historyId ? { ...item, rating: value } : item));
  };

  // Delete individual ingredients
  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  // Helper function to see ingredients count match for a recipe
  const getIngredientMatchText = (recipe: Recipe) => {
    if (pantryIsEmpty) return { text: 'Te faltan ingredientes', style: 'text-prepeasy-error bg-red-50 border-red-100' };
    
    const needed = recipe.ingredientsNeeded.filter(n => n.required);
    const inPantryTotal = needed.filter(n => 
      ingredients.some(i => i.name.toLowerCase().includes(n.name.toLowerCase().substring(0, 5)))
    ).length;

    if (inPantryTotal === needed.length) {
      return { text: 'Tienes todo en casa', style: 'text-prepeasy-primary bg-prepeasy-primary-light border-green-200' };
    } else if (inPantryTotal > 0) {
      const missingTotal = needed.length - inPantryTotal;
      return { text: `Falta ${missingTotal} ingrediente${missingTotal > 1 ? 's' : ''}`, style: 'text-amber-700 bg-amber-50 border-amber-200' };
    } else {
      return { text: 'Faltan ingredientes', style: 'text-prepeasy-error bg-red-50 border-red-100' };
    }
  };

  const getIngredientImage = (ing: Ingredient): string => {
    const nameLower = ing.name.toLowerCase();
    const match = Object.keys(INGREDIENT_IMAGES).find(key => nameLower.includes(key));
    return match ? INGREDIENT_IMAGES[match] : CATEGORY_FALLBACK_IMAGES[ing.category];
  };

  // Filtered recipes matching energy selection & pantry connection
  const activeRecipes = recipes.filter(r => r.energyLevel === energyLevel);

  return (
    <div className="min-h-screen bg-[#F0F4EE] flex flex-col items-center justify-center font-sans overflow-hidden text-neutral-800 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/90 via-[#F0F4EE] to-[#E2EBE0]">
      
      {/* Central application frame: pristine full viewport on mobile, elegantly framed column on desktop */}
      <div className="w-full max-w-md bg-prepeasy-bg flex flex-col relative h-screen shadow-2xl border-x border-stone-200/40">
        
        {/* Global Dynamic Application Header */}
        <header className="flex justify-between items-center px-5 py-4 bg-[#F9FBF8] border-b border-stone-200/40 shrink-0">
          <div className="flex items-center gap-2">
            <div 
              id="user-avatar"
              className="w-10 h-10 rounded-full bg-prepeasy-primary text-white flex items-center justify-center font-serif font-black text-xl border-2 border-prepeasy-primary-dark/25 shadow-xs cursor-pointer active:scale-95 transition-all select-none"
              onClick={() => setAvatarIndex(prev => (prev + 1) % avatars.length)}
            >
              P
            </div>
            <span className="font-serif text-2.5xl font-bold text-prepeasy-primary tracking-tight">PrepEasy</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Live simulation controllers panel trigger */}
            <button 
              onClick={() => setShowSimPanelOnMobile(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-500 hover:text-prepeasy-primary transition-all relative"
              title="Consola de simulación"
            >
              <Sliders className="w-5 h-5" />
            </button>

            <button 
              id="notification-bell"
              onClick={() => setShowNotification(!showNotification)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 transition-all relative text-stone-500 hover:text-prepeasy-primary"
            >
              <Bell className="w-5 h-5" />
              {!pantryIsEmpty && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-prepeasy-error"></span>
              )}
            </button>
          </div>
        </header>

        {/* Interactive Notification Overlay Panel */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-prepeasy-surface-muted z-30 space-y-3"
            >
              <h4 className="text-xs font-bold text-prepeasy-text-primary tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                <Bell className="w-3.5 h-3.5 text-prepeasy-primary" /> Recordatorios vespertinos
              </h4>
              <div className="space-y-2.5">
                {!pantryIsEmpty ? (
                  <>
                    <div className="text-xs text-prepeasy-text-primary bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-prepeasy-warning shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-900 text-[11px]">¿Día largo en la oficina?</span>
                        <p className="text-stone-600 mt-0.5 text-[11px]">Tienes 3 ingredientes próximos a caducar. Cocina algo con espinacas frescas hoy.</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200">
                      🥗 ¡Tu plan semanal va al día! Has cocinado 3 cenas caseras esta semana.
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-prepeasy-text-primary p-2 rounded-lg bg-neutral-50 text-center text-stone-500">
                    Tu despensa está completamente vacía. Registra ingredientes para recibir alertas inteligentes.
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="w-full text-center text-[11px] font-bold text-prepeasy-primary hover:underline hover:text-prepeasy-primary-dark pt-1.5"
              >
                Cerrar notificaciones
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Middle Application View Container */}
        <div className="flex-1 overflow-y-auto px-5 pb-24 relative" id="app-view-container">
          
          <AnimatePresence mode="wait">
            
            {/* SCREEN 3: OFFLINE MODE (Highest logic precedence if state is offline) */}
            {appState === 'offline' ? (
              <motion.div 
                key="offline-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-4 space-y-5 h-full flex flex-col justify-between"
              >
                {/* Offline box matching Screen 3 layout perfectly */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-md text-center flex flex-col items-center justify-center space-y-4 pt-12">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-prepeasy-error">
                    <WifiOff className="w-8 h-8" />
                  </div>
                  
                  <h2 className="font-serif text-4xl font-bold text-prepeasy-text-primary mt-2">Sin conexión</h2>
                  <p className="text-xs text-prepeasy-text-secondary leading-relaxed max-w-xs">
                    No pudimos conectar con el servidor. Puedes seguir accediendo a las recetas guardadas localmente en tu dispositivo.
                  </p>
                  
                  <button 
                    onClick={() => setActiveTab('historial')}
                    className="w-full bg-prepeasy-primary hover:bg-prepeasy-primary-dark text-white rounded-full py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <BookOpen className="w-4 h-4" /> Ver mis recetas guardadas
                  </button>
                </div>

                {/* Grid controls */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setAppState('loading');
                      setTimeout(() => setAppState('connected'), 1200);
                    }}
                    className="bg-white rounded-2xl p-4 border border-neutral-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-prepeasy-surface-container shadow-sm transition-all text-neutral-800"
                  >
                    <RotateCcw className="w-5 h-5 text-prepeasy-primary" />
                    <span className="text-xs font-semibold">Reintentar</span>
                  </button>

                  <button 
                    onClick={() => {
                      setAppState('connected');
                      setActiveTab('historial');
                    }}
                    className="bg-white rounded-2xl p-4 border border-neutral-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-prepeasy-surface-container shadow-sm transition-all text-neutral-800"
                  >
                    <History className="w-5 h-5 text-prepeasy-primary" />
                    <span className="text-xs font-semibold">Historial</span>
                  </button>
                </div>

                {/* Spinach watermark at bottom */}
                <div className="relative h-44 rounded-2xl overflow-hidden mt-2 bg-neutral-100 border border-neutral-200/50 flex flex-col items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=200" 
                    alt="Espinacas" 
                    className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale"
                  />
                  <div className="relative text-center space-y-1">
                    <span className="text-[11px] font-bold tracking-widest text-[#5E5E5E]">Modo offline activo</span>
                    <div className="w-12 h-1.5 bg-prepeasy-primary mx-auto rounded-full mt-1.5"></div>
                  </div>
                </div>
              </motion.div>
            ) : 

            /* SKELETON SCREEN (Screen 1): Simulated Loading placeholders */
            appState === 'loading' ? (
              <motion.div 
                key="skeleton-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 space-y-6"
              >
                {/* Skeletons mimicking Screen 1 precisely */}
                <div className="space-y-2">
                  <div className="w-3/4 h-8 bg-neutral-200 rounded-md animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-neutral-200 rounded-md animate-pulse"></div>
                </div>

                <div className="w-full h-10 bg-neutral-200 rounded-xl animate-pulse"></div>

                <div className="flex gap-3 overflow-x-hidden pt-2">
                  <div className="w-24 h-24 bg-neutral-200 rounded-2xl animate-pulse shrink-0"></div>
                  <div className="w-24 h-24 bg-neutral-200 rounded-2xl animate-pulse shrink-0"></div>
                  <div className="w-24 h-24 bg-neutral-200 rounded-2xl animate-pulse shrink-0"></div>
                </div>

                <div className="w-full h-4 bg-neutral-200 rounded-md animate-pulse mt-4"></div>
                
                {/* Large Recipe Skeleton Card */}
                <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm h-80 flex flex-col">
                  <div className="h-44 bg-neutral-200 animate-pulse"></div>
                  <div className="p-4 flex-1 space-y-2">
                    <div className="w-5/6 h-5 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="w-1/4 h-3 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="flex gap-2 pt-2">
                      <div className="w-20 h-6 bg-neutral-200 rounded-full animate-pulse"></div>
                      <div className="w-14 h-6 bg-neutral-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="w-2/3 h-5 bg-neutral-200 rounded animate-pulse"></div>

                {/* List Skeleton */}
                <div className="bg-white rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 bg-neutral-200 rounded-xl animate-pulse shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="w-1/2 h-3 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ) :

            /* ACTIVE RECIPE STUDY & COOKING SCREEN */
            activeCookingRecipe ? (
              <motion.div 
                key="cooking-recipe-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-4 space-y-6"
              >
                {/* Custom back button */}
                <button 
                  onClick={() => setActiveCookingRecipe(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-prepeasy-primary bg-prepeasy-primary-light py-1.5 px-3 rounded-full hover:bg-opacity-80 transition-all self-start"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a sugerencias
                </button>

                {/* Recipe Hero banner */}
                <div className="rounded-3xl overflow-hidden relative shadow-md bg-stone-100">
                  <img 
                    src={activeCookingRecipe.imageUrl} 
                    alt={activeCookingRecipe.title} 
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-3.5 rounded-full text-[11px] font-bold text-prepeasy-text-primary shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-prepeasy-primary" /> {activeCookingRecipe.prepTime} min netos
                  </div>
                </div>

                {/* Header Information */}
                <div>
                  <h2 className="font-serif text-3xl font-bold text-prepeasy-text-primary leading-tight">{activeCookingRecipe.title}</h2>
                  <p className="text-xs text-prepeasy-text-secondary mt-1">{activeCookingRecipe.description}</p>
                </div>

                {/* Utensils required */}
                <div className="flex gap-2">
                  {activeCookingRecipe.utensils.map((ut, idx) => (
                    <span key={idx} className="bg-prepeasy-surface-container border border-neutral-200/50 text-[11px] font-bold text-[#5E5E5E] py-1 px-2.5 rounded-lg flex items-center gap-1">
                      🍳 {ut}
                    </span>
                  ))}
                  <span className="bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-prepeasy-primary py-1 px-2.5 rounded-lg">
                    ✨ Energía: {activeCookingRecipe.energyLevel === 'low' ? 'Mínima' : activeCookingRecipe.energyLevel === 'balanced' ? 'Media' : 'Equilibrio'}
                  </span>
                </div>

                {/* Interactive kitchen countdown timer widget */}
                <div className="bg-white p-4 rounded-2xl border border-prepeasy-surface-muted shadow-sm space-y-3">
                  <div className="flex justify-between items-center bg-prepeasy-bg p-2 rounded-xl border border-dashed border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-prepeasy-primary animate-pulse" />
                      <span className="text-xs font-bold text-prepeasy-primary-dark">Minutero de Cocina Activa:</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-prepeasy-text-primary">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startKitchenTimer(60)}
                      className="flex-1 py-1 px-2 bg-white border border-stone-200 hover:border-prepeasy-primary text-xs font-medium rounded-lg"
                    >
                      +1 min
                    </button>
                    <button 
                      onClick={() => startKitchenTimer(300)}
                      className="flex-1 py-1 px-2 bg-white border border-stone-200 hover:border-prepeasy-primary text-xs font-medium rounded-lg"
                    >
                      +5 min
                    </button>
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg text-white ${isTimerRunning ? 'bg-amber-500' : 'bg-prepeasy-primary'}`}
                    >
                      {isTimerRunning ? 'Pausar' : 'Iniciar'}
                    </button>
                  </div>
                  {timerSeconds === 0 && (
                    <div className="text-center text-xs font-bold text-prepeasy-error animate-bounce">
                      🔔 ¡Temporizador completado! Listo para el siguiente paso.
                    </div>
                  )}
                </div>

                {/* Ingredients checklist */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Ingredientes necesarios</h3>
                  <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
                    {activeCookingRecipe.ingredientsNeeded.map((ing, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-prepeasy-text-primary">{ing.name}</span>
                        <div className="flex items-center gap-2">
                          {ing.inPantry && !pantryIsEmpty ? (
                            <span className="bg-emerald-50 text-prepeasy-primary text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-100">En Despensa</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-100">Por usar</span>
                          )
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooking active step by step instructions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Paso a paso (Cerra el plato)</h3>
                  <div className="space-y-2">
                    {activeCookingRecipe.steps.map((step, idx) => {
                      const isCompleted = completedSteps.includes(idx);
                      return (
                        <div 
                          key={idx}
                          id={`step-${idx}`}
                          onClick={() => {
                            if (isCompleted) {
                              setCompletedSteps(completedSteps.filter(s => s !== idx));
                            } else {
                              setCompletedSteps([...completedSteps, idx]);
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 select-none ${
                            isCompleted 
                              ? 'bg-neutral-100/70 border-neutral-200/50 opacity-48 line-through text-stone-500' 
                              : 'bg-white border-neutral-200/60 shadow-xs hover:border-prepeasy-primary'
                          }`}
                          style={{ padding: '16px' /* Meets 16px vertical padding of Active Recipe constraint */ }}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            isCompleted ? 'bg-prepeasy-primary border-prepeasy-primary text-white' : 'border-stone-300 bg-white text-stone-500'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] font-bold">{idx + 1}</span>}
                          </div>
                          <span className="text-xs leading-relaxed font-sans">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completion action drawer */}
                <div className="bg-white p-4 rounded-2xl border border-dashed border-prepeasy-primary/30 flex flex-col items-center text-center space-y-3">
                  <h4 className="text-xs font-bold text-prepeasy-primary-dark">¡Cena Terminada!</h4>
                  <p className="text-[11px] text-prepeasy-text-secondary">¿Has terminado el plato con éxito? Haz clic en registrar para guardarlo en tu historial y liberar la despensa.</p>
                  <button 
                    onClick={finishCooking}
                    className="w-full bg-prepeasy-primary hover:bg-prepeasy-primary-dark text-white rounded-full py-3 px-6 text-xs font-bold transition-all shadow-sm"
                  >
                    Registrar cena elaborada ✔
                  </button>
                </div>

              </motion.div>
            ) :

            /* VIEW: INICIO TAB (Screen 4) */
            activeTab === 'inicio' ? (
              <motion.div 
                key="inicio-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                
                {/* Greeting Header */}
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight" id="greeting-title">
                    ¿Qué cocinamos hoy, {userName}?
                  </h1>
                  <p className="text-xs text-prepeasy-text-secondary leading-normal">
                    Recetas según lo que tienes en casa y cómo te sientes.
                  </p>
                </div>                {/* Energy selector chips matching Screen 4 */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 bg-prepeasy-surface-muted/60 p-1.5 rounded-2xl border border-[#EEF1ED]" id="energy-level-chips">
                    <button 
                      onClick={() => setEnergyLevel('low')}
                      className={`flex-1 py-2.5 px-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                        energyLevel === 'low' 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary shadow-xs font-semibold' 
                          : 'hover:bg-white/40 text-stone-500'
                      }`}
                    >
                      Algo rápido
                    </button>
                    
                    <button 
                      onClick={() => setEnergyLevel('balanced')}
                      className={`flex-1 py-2.5 px-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                        energyLevel === 'balanced' 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary shadow-xs font-semibold' 
                          : 'hover:bg-white/40 text-stone-500'
                      }`}
                    >
                      Sin apuro
                    </button>

                    <button 
                      onClick={() => setEnergyLevel('disconnect')}
                      className={`flex-1 py-2.5 px-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                        energyLevel === 'disconnect' 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary shadow-xs font-semibold' 
                          : 'hover:bg-white/40 text-stone-500'
                      }`}
                    >
                      Hoy me luzco
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-xl font-bold text-prepeasy-text-primary">Sugerencias para ti</h2>
                  <button 
                    onClick={() => setActiveTab('recetas')}
                    className="text-xs font-bold text-prepeasy-primary hover:underline hover:text-prepeasy-primary-dark"
                  >
                    Ver todas
                  </button>
                </div>

                {/* Suggestion Carousel Cards (horizontal scroll style simulating screen carousel) */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none -mx-5 px-5" id="suggestions-carousel">
                  {activeRecipes.map((recipe, index) => {
                    const match = getIngredientMatchText(recipe);
                    return (
                      <div 
                        key={recipe.id}
                        className="w-72 bg-white rounded-3xl overflow-hidden border border-neutral-100 flex-shrink-0 snap-center shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Upper label / Etiqueta superior */}
                        {index === 0 && (
                          <div className="bg-amber-500 text-white text-[11px] font-bold text-center py-1.5 tracking-wider">
                            Aprovecha antes que se pierda
                          </div>
                        )}

                        {/* Upper image and duration widget */}
                        <div className="relative">
                          <img 
                            src={recipe.imageUrl} 
                            alt={recipe.title} 
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full text-[11px] font-bold text-stone-800 shadow-xs flex items-center gap-1">
                            <Clock className="w-3 h-3 text-prepeasy-primary" /> {recipe.prepTime} min netos
                          </div>
                        </div>

                        {/* Card copy content */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-prepeasy-text-primary leading-snug">{recipe.title}</h3>
                            
                            {/* Chips */}
                            <div className="flex gap-1.5 flex-wrap mt-2.5">
                              {index === 0 ? (
                                <>
                                  <span className="text-[11px] font-bold py-0.5 px-2 rounded-md border text-amber-700 bg-amber-50 border-amber-200">
                                    4 ingredientes próximos a vencer
                                  </span>
                                  <span className="bg-[#EEF1ED] text-stone-600 text-[11px] font-bold py-0.5 px-2 rounded-md border border-[#EEF1ED]">
                                    1 sartén
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className={`text-[11px] font-bold py-0.5 px-2 rounded-md border ${match.style}`}>
                                    {match.text}
                                  </span>
                                  <span className="bg-[#EEF1ED] text-stone-600 text-[11px] font-bold py-0.5 px-2 rounded-md border border-[#EEF1ED]">
                                    {recipe.utensils[0] || '1 utensilio'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button 
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setActiveCookingRecipe(recipe);
                            }}
                            className="w-full bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-2xl py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span>Empezar a cocinar</span> 🍳
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Revisar mi despensa CTA */}
                <div 
                  onClick={() => setActiveTab('despensa')}
                  className="bg-white rounded-3xl p-4 border border-neutral-100 hover:border-prepeasy-primary shadow-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-prepeasy-primary-light flex items-center justify-center text-prepeasy-primary relative">
                      <ShoppingBag className="w-6 h-6" />
                      {expiringIngredientsCount > 0 && !pantryIsEmpty && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-prepeasy-error rounded-full text-[11px] font-bold text-white flex items-center justify-center animate-bounce">
                          {expiringIngredientsCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-prepeasy-text-primary font-sans">Revisar Mi Despensa</h4>
                      <p className="text-[11px] text-[#5E5E5E] mt-0.5">
                        {!pantryIsEmpty 
                          ? `Tienes ${expiringIngredientsCount} productos frescos por caducar esta semana.` 
                          : 'Tu despensa está vacía. Añada hoy ingredientes.'
                        }
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>


              </motion.div>
            ) : 

            /* VIEW: MI DESPENSA TAB (Screen 2 & Filled interactive Pantry) */
            activeTab === 'despensa' ? (
              <motion.div 
                key="despensa-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                
                {/* Header title */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Mi Despensa</h1>
                    <p className="text-xs text-stone-500 mt-1">Existencias de tu hogar para recetas locales.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddIngredientModal(true)}
                    className="w-10 h-10 rounded-full bg-prepeasy-primary text-white flex items-center justify-center hover:bg-prepeasy-primary-dark transition-all"
                    title="Añadir ingrediente"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* STATE A: EMPTY STATE (Screenshot 2 style if empty) */}
                {pantryIsEmpty || ingredients.length === 0 ? (
                  <div className="space-y-6">
                    {/* Device cupboard/Cabinet SVG and mint artwork */}
                    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
                      
                      {/* High fidelity Cabinet outline simulation with mint sprig */}
                      <div className="w-full max-w-[200px] aspect-square rounded-2xl bg-stone-50/50 border border-stone-200/60 p-4 relative flex flex-col justify-between overflow-hidden shadow-xs">
                        
                        {/* Shleves lines */}
                        <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-stone-200"></div>
                        <div className="absolute top-2/3 left-0 right-0 h-[2px] bg-stone-200"></div>
                        
                        {/* Faint refrigerator icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <ShoppingBag className="w-24 h-24 text-prepeasy-primary" />
                        </div>

                        {/* Single mint leaf sprig on bottom shelf matching Screenshot 2 perfectly */}
                        <div className="mx-auto mt-auto relative z-10 p-1 flex flex-col items-center">
                          <svg className="w-12 h-12 text-[#2D9D4E] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2C12,2 6,6 6,12C6,16 10,18 12,21C14,18 18,16 18,12C18,6 12,2 12,2M12,18.5C11,17 8.5,15.5 8.5,12C8.5,8.5 12,5.5 12,5.5C12,5.5 15.5,8.5 15.5,12C15.5,15.5 13,17 12,18.5Z"/>
                          </svg>
                          <span className="text-[11px] font-mono font-bold text-prepeasy-primary mt-1 opacity-80">Hoja de albahaca</span>
                        </div>
                      </div>

                      {/* Heading matches Screen 2 precisely */}
                      <h3 className="font-serif text-lg font-bold text-[#1F6B35] text-center mt-4">Tu despensa está vacía</h3>
                      <p className="text-xs text-stone-500 text-center leading-relaxed max-w-xs mt-1">
                        Registra los ingredientes que tienes en casa para que podamos recomendarte cenas rápidas sin salir a comprar.
                      </p>

                      <button 
                        onClick={() => setShowAddIngredientModal(true)}
                        className="mt-6 bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-full py-3.5 px-6 text-xs font-bold transition-all shadow-md hover:shadow-lg w-full flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" /> Agregar ingredientes ahora
                      </button>
                      
                      <span className="text-[11px] tracking-wider font-bold text-[#A8A8A8] mt-3">Toma solo 2 minutos</span>
                    </div>

                    {/* Scan receipt button matches screen 2 */}
                    <div 
                      onClick={handleReceiptScan}
                      className="bg-[#D4F4DD] p-4 rounded-2xl border border-emerald-200/80 cursor-pointer hover:bg-opacity-90 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-prepeasy-primary">
                          <Camera className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-prepeasy-primary-dark tracking-wider">Escanear recibo</h4>
                          <p className="text-[11px] text-[#5E5E5E] mt-0.5">Importa todo automáticamente</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#1F6B35]" />
                    </div>

                  </div>
                ) : (
                  
                  /* STATE B: DETAILED INVENTORY LIST */
                  <div className="space-y-4">
                    
                    {/* Scanned loading animation */}
                    {isScanningReceipt && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-dashed border-prepeasy-primary text-center space-y-2 animate-pulse">
                        <Camera className="w-6 h-6 mx-auto text-prepeasy-primary animate-spin" />
                        <span className="text-xs font-bold text-prepeasy-primary">Leyendo recibo del supermercado (OCR)...</span>
                      </div>
                    )}

                    {/* Shopping receipt scanner shortcut even in active list */}
                    <button 
                      onClick={handleReceiptScan}
                      className="w-full bg-prepeasy-primary-light hover:bg-opacity-80 py-2.5 px-4 rounded-xl text-center text-xs font-bold text-prepeasy-primary flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Escanear otro tique de compra
                    </button>

                    {/* Active list display */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-3 space-y-2 divide-y divide-neutral-50 shadow-xs">
                      {ingredients.map((ing) => {
                        const isNearing = ing.expirationDays <= 2;
                        const isExpiringToday = ing.expirationDays === 0;
                        
                        return (
                          <div key={ing.id} className="pt-2 pb-1 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border ${isNearing ? 'border-red-200' : 'border-neutral-100'}`}>
                                <img
                                  src={getIngredientImage(ing)}
                                  alt={ing.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.classList.add('flex','items-center','justify-center','bg-prepeasy-bg'); (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xs font-bold text-prepeasy-primary">${ing.name.charAt(0)}</span>`; }}
                                />
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-prepeasy-text-primary">{ing.name}</h4>
                                <div className="flex gap-1.5 items-center mt-0.5">
                                  <span className="text-[11px] text-stone-500 font-mono">{ing.quantity}</span>
                                  <span className="text-stone-300">•</span>
                                  <span className={`text-[11px] font-bold ${
                                    isExpiringToday ? 'text-prepeasy-error' : isNearing ? 'text-amber-600' : 'text-stone-500'
                                  }`}>
                                    {isExpiringToday ? 'Caduca hoy' : `Caduca en ${ing.expirationDays} días`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleDeleteIngredient(ing.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-prepeasy-error transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-center text-stone-400">Deslice hacia la izquierda o haga clic en el bote para eliminar existencias consumidas manualmente.</p>
                  </div>
                )}

              </motion.div>
            ) : 

            /* VIEW: PLANIFICADOR TAB */
            activeTab === 'planificador' ? (
              <motion.div 
                key="planificador-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                
                <div>
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Planificador</h1>
                  <p className="text-xs text-stone-500 mt-1">Gabinete de cenas balanceado para tu bienestar.</p>
                </div>

                {/* Calendar list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Próximos días del ciclo</h3>
                  
                  <div className="space-y-2.5">
                    {[
                      { day: 'Lunes', recipe: 'Crema templada de calabacín y albahaca', energy: 'Low Energy', cooked: true },
                      { day: 'Martes', recipe: 'Ensalada tibia de espinacas y aguacate', energy: 'Low Energy', cooked: true },
                      { day: 'Miércoles (Hoy)', recipe: 'Pasta integral con tomate cherry y ricotta', energy: 'Balanced Energy', active: true },
                      { day: 'Jueves', recipe: 'Salmón al vapor con costra de hierbas', energy: 'Balanced Energy' },
                      { day: 'Viernes', recipe: 'Risotto de setas y parmesano silvestre', energy: 'Disconnect Ritual' }
                    ].map((plan, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                          plan.active 
                            ? 'bg-prepeasy-primary-light border-green-200' 
                            : plan.cooked ? 'bg-stone-100/65 opacity-60 border-stone-200' : 'bg-white border-neutral-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-[11px] font-bold tracking-wider ${plan.active ? 'text-prepeasy-primary' : 'text-[#5E5E5E]'}`}>{plan.day}</span>
                          <h4 className="font-serif font-bold text-stone-800 text-sm leading-tight">{plan.recipe}</h4>
                        </div>
                        <div className="text-[11px] py-1 px-2.5 rounded-md text-stone-600 bg-neutral-100 font-bold border border-neutral-200/20 whitespace-nowrap">
                          {plan.energy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Groceries List calculator based on planned dinners */}
                <div className="bg-white p-4 rounded-3xl border border-neutral-100 space-y-3.5 shadow-xs">
                  <div className="flex gap-2 items-center">
                    <ShoppingBag className="w-5 h-5 text-prepeasy-primary" />
                    <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-primary">Mi lista de compras</h3>
                  </div>

                  <p className="text-[11px] text-stone-500">Ingredientes faltantes calculados para tus platos del jueves y viernes:</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                      <span className="font-semibold text-stone-800">1. Lomo de salmón fresco</span>
                      <span className="text-stone-500 font-mono">1 un.</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                      <span className="font-semibold text-stone-800">2. Setas variadas</span>
                      <span className="text-stone-500 font-mono">200g</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                      <span className="font-semibold text-stone-800">3. Limón</span>
                      <span className="text-stone-500 font-mono">2 un.</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex flex-col space-y-2">
                    {/* Partner premium upgrade integration as specified in content.md */}
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center space-y-1">
                      <span className="text-[11px] font-bold text-prepeasy-primary tracking-wide flex items-center justify-center gap-1">
                        🚀 Socio de compra integrado
                      </span>
                      <p className="text-[11px] text-stone-500">Ahorra tiempo enviando esta lista directo a Carrefour o Mercadona en 1 clic.</p>
                    </div>

                    <button 
                      onClick={() => alert('Socio de Compra Premium: Envío completado con éxito a su carrito del supermercado.')}
                      className="w-full bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-xl py-2.5 px-4 text-xs font-bold font-sans flex items-center justify-center gap-1 transition-all"
                    >
                      Enviar a supermercado asociado
                    </button>
                  </div>
                </div>

              </motion.div>
            ) : 

            /* VIEW: HISTORIAL TAB */
            activeTab === 'historial' ? (
              <motion.div 
                key="historial-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                
                <div>
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Mi Historial</h1>
                  <p className="text-xs text-stone-500 mt-1">Cenas elaboradas por ti en casa y tiempo ahorrado.</p>
                </div>

                {/* Dashboard stats cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-neutral-100 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10.5px] font-bold tracking-wider text-stone-500">Tiempo horario</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-prepeasy-primary" />
                      <span className="text-2xl font-serif font-black text-prepeasy-primary-dark">40 min</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Cocina activa en lote.</p>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10.5px] font-bold tracking-wider text-stone-500">Saldo protegido</span>
                    <div className="flex items-center gap-1 col-span-1">
                      <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
                      <span className="text-2xl font-serif font-black text-stone-800">4 platos</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Cero residuos culinarios.</p>
                  </div>
                </div>

                {/* Items collection list */}
                <div className="space-y-3.5">
                  <span className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Últimos platos cenados</span>
                  
                  <div className="bg-white rounded-3xl p-3.5 border border-neutral-100 space-y-4 shadow-xs divide-y divide-neutral-100">
                    {history.map((hist, idx) => (
                      <div key={hist.id} className={`${idx > 0 ? 'pt-4' : ''} space-y-2.5`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-stone-800 text-sm leading-tight">{hist.recipeTitle}</h4>
                            <span className="text-[11px] text-stone-400 mt-0.5 block">{hist.date}</span>
                          </div>
                          <span className="bg-[#EEF1ED] text-stone-600 text-[11px] font-bold py-1 px-2 rounded-lg">
                            {hist.timeSaved} min netos
                          </span>
                        </div>

                        {/* Star Rating feedback */}
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#5E5E5E] font-medium font-sans">Tu opinión:</span>
                          <div className="flex gap-1" id={`rating-group-${hist.id}`}>
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button 
                                key={starVal}
                                onClick={() => handleSetRating(hist.id, starVal)}
                                className="p-0.5 transition-all hover:scale-110"
                                title={`Sellar ${starVal} estrellas`}
                              >
                                <Star className={`w-3.5 h-3.5 ${starVal <= hist.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium onboarding preview button */}
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-prepeasy-primary border-dashed text-center space-y-2">
                  <span className="text-xs font-bold text-prepeasy-primary-dark block">¿Te gusta automatizar tu rutina?</span>
                  <p className="text-[11px] text-stone-600">Actualiza a PrepEasy Premium para desbloquear estadísticas totales de macronutrientes.</p>
                  <button 
                    onClick={() => alert('¡Gracias por el interés! PrepEasy Premium se encuentra en fase Beta.')}
                    className="w-full bg-prepeasy-primary py-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
                  >
                    Probar 7 días gratis
                  </button>
                </div>

              </motion.div>
            ) : 

            /* VIEW: RECETAS TAB */
            activeTab === 'recetas' ? (
              <motion.div 
                key="recetas-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                
                {/* Header back button & Title */}
                <div className="space-y-3.5">
                  <button 
                    onClick={() => {
                      setActiveTab('inicio');
                      setSearchQuery('');
                      setGalleryEnergyFilter('all');
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-prepeasy-primary bg-prepeasy-primary-light py-1.5 px-3.5 rounded-full hover:bg-opacity-80 transition-all self-start"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a Inicio
                  </button>

                  <div>
                    <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Todas las recetas</h1>
                    <p className="text-xs text-stone-500 mt-1">Explora nuestro catálogo completo de platos nutritivos y saludables.</p>
                  </div>
                </div>

                {/* Search Bar & Stats */}
                <div className="space-y-3.5">
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-white rounded-2xl border border-neutral-200/60 py-3.5 pl-11 pr-4 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-prepeasy-primary"
                      placeholder="Buscar por ingredientes o nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  </div>

                  {/* Filter chips */}
                  <div className="flex gap-1.5 flex-wrap py-1 select-none">
                    {[
                      { key: 'all', label: 'Todas' },
                      { key: 'low', label: 'Algo rápido (<15 min)' },
                      { key: 'balanced', label: 'Sin apuro (15-20 min)' },
                      { key: 'disconnect', label: 'Hoy me luzco (>20 min)' }
                    ].map((chip) => (
                      <button 
                        key={chip.key}
                        onClick={() => setGalleryEnergyFilter(chip.key as any)}
                        className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all border ${
                          galleryEnergyFilter === chip.key 
                            ? 'bg-prepeasy-primary text-white border-prepeasy-primary shadow-xs' 
                            : 'bg-white text-stone-600 border-neutral-100 hover:bg-stone-50'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid / List of recipes */}
                <div className="space-y-4">
                  {(() => {
                    const filtered = recipes.filter(r => {
                      const matchesEnergy = galleryEnergyFilter === 'all' || r.energyLevel === galleryEnergyFilter;
                      const matchesSearch = searchQuery.trim() === '' || 
                        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.ingredientsNeeded.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
                      return matchesEnergy && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white rounded-3xl p-8 border border-neutral-100 text-center space-y-3.5 shadow-xs">
                          <p className="text-stone-500 text-xs font-medium">No se encontraron recetas con tu criterio de búsqueda.</p>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setGalleryEnergyFilter('all');
                            }}
                            className="bg-prepeasy-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all"
                          >
                            Restablecer filtros
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filtered.map((recipe) => {
                          const match = getIngredientMatchText(recipe);
                          return (
                            <div 
                              key={recipe.id}
                              className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-sm transition-all flex flex-col"
                            >
                              <div className="relative h-40 bg-stone-50">
                                <img 
                                  src={recipe.imageUrl} 
                                  alt={recipe.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full text-[11px] font-bold text-stone-800 shadow-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-prepeasy-primary" /> {recipe.prepTime} min netos
                                </div>
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-serif text-lg font-bold text-prepeasy-text-primary leading-tight">{recipe.title}</h3>
                                    <span className={`text-[11px] font-bold py-0.5 px-2 rounded-md border shrink-0 ${match.style}`}>
                                      {match.text}
                                    </span>
                                  </div>
                                  <p className="text-xs text-prepeasy-text-secondary leading-relaxed">{recipe.description}</p>
                                
                                  {/* Badges */}
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="bg-[#EEF1ED] text-stone-600 text-[11px] font-bold py-0.5 px-2 rounded-md border border-[#EEF1ED]">
                                      {recipe.energyLevel === 'low' ? 'Algo rápido ⚡' : recipe.energyLevel === 'balanced' ? 'Equilibrado ⚖️' : 'Hoy me luzco ✨'}
                                    </span>
                                    {recipe.utensils.map((ut, idx) => (
                                      <span key={idx} className="bg-stone-50 text-stone-500 text-[11px] font-bold py-0.5 px-2 rounded-md border border-stone-200/50">
                                        🍳 {ut}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <button 
                                  onClick={() => {
                                    setSelectedRecipe(recipe);
                                    setActiveCookingRecipe(recipe);
                                  }}
                                  className="w-full bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-2xl py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <span>Empezar a cocinar</span> 🍳
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </motion.div>
            ) : null}

          </AnimatePresence>

        </div>

        {/* SCREEN FOOTER: Nav bottom layout bar matching screenshots exactly */}
        <nav className="absolute bottom-0 left-0 right-0 h-[68px] bg-white border-t border-neutral-100 flex items-center justify-around z-10" id="bottom-navbar">
          
          {/* Item 1: Inicio */}
          <button 
            onClick={() => {
              setActiveTab('inicio');
              setSelectedRecipe(null);
            }} 
            className="flex flex-col items-center justify-center space-y-1 relative group w-16"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'inicio' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <svg className="w-5 h-5 text-prepeasy-primary-dark z-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
                <span className="text-[11px] font-bold text-prepeasy-primary-dark z-10">Inicio</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
                <span className="text-[11px] font-medium text-stone-500">Inicio</span>
              </>
            )}
          </button>

          {/* Item 2: Mi Despensa */}
          <button 
            onClick={() => {
              setActiveTab('despensa');
              setSelectedRecipe(null);
            }} 
            className="flex flex-col items-center justify-center space-y-1 relative group w-[75px]"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'despensa' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <ShoppingBag className="w-5 h-5 text-prepeasy-primary-dark z-10" />
                <span className="text-[11px] font-bold text-prepeasy-primary-dark z-10">Mi Despensa</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-[11px] font-medium text-stone-500">Mi Despensa</span>
              </>
            )}
          </button>

          {/* Item 3: Planificador */}
          <button 
            onClick={() => {
              setActiveTab('planificador');
              setSelectedRecipe(null);
            }} 
            className="flex flex-col items-center justify-center space-y-1 relative group w-[75px]"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'planificador' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <BookOpen className="w-5 h-5 text-prepeasy-primary-dark z-10" />
                <span className="text-[11px] font-bold text-prepeasy-primary-dark z-10">Planificador</span>
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-[11px] font-medium text-stone-500">Planificador</span>
              </>
            )}
          </button>

          {/* Item 4: Historial */}
          <button 
            onClick={() => {
              setActiveTab('historial');
              setSelectedRecipe(null);
            }} 
            className="flex flex-col items-center justify-center space-y-1 relative group w-16"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'historial' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <History className="w-5 h-5 text-prepeasy-primary-dark z-10" />
                <span className="text-[11px] font-bold text-prepeasy-primary-dark z-10">Historial</span>
              </>
            ) : (
              <>
                <History className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-[11px] font-medium text-stone-500">Historial</span>
              </>
            )}
          </button>

        </nav>

        {/* Modal: Agregar Ingrediente Manual */}
        <AnimatePresence>
          {showAddIngredientModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/65 backdrop-blur-md z-[110] flex items-center justify-center p-0"
            >
              <motion.form 
                onSubmit={handleAddIngredient}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-white w-full h-full flex flex-col justify-between p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-serif font-bold text-stone-800 text-xl">Añadir Ingrediente</h3>
                  <button
                    type="button"
                    onClick={() => { setShowAddIngredientModal(false); setIngFormErrors({}); }}
                    className="text-stone-400 hover:text-stone-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable form body context */}
                <div className="flex-1 py-6 space-y-6 overflow-y-auto max-w-lg mx-auto w-full">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 tracking-wider">Nombre del alimento</label>
                    <input
                      type="text"
                      value={newIngName}
                      onChange={(e) => { setNewIngName(e.target.value); setIngFormErrors(prev => ({ ...prev, name: undefined })); }}
                      className={`w-full text-sm p-3 bg-[#F7F9F6] rounded-xl focus:ring-1 focus:ring-prepeasy-primary outline-hidden border ${ingFormErrors.name ? 'border-[#EF5350] focus:border-[#EF5350]' : 'border-[#D5D5D5] focus:border-[#2D9D4E]'}`}
                      placeholder="Ej: Aguacate maduro"
                    />
                    {ingFormErrors.name && <p className="text-[11px] text-[#EF5350] font-medium">{ingFormErrors.name}</p>}
                  </div>

                  {/* Cantidad + Unidad */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 tracking-wider">Cantidad</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={newIngQtyAmount}
                        onChange={(e) => { setNewIngQtyAmount(e.target.value === '' ? '' : Number(e.target.value)); setIngFormErrors(prev => ({ ...prev, qty: undefined })); }}
                        className={`flex-1 text-sm p-3 bg-[#F7F9F6] rounded-xl focus:ring-1 focus:ring-prepeasy-primary outline-hidden border ${ingFormErrors.qty ? 'border-[#EF5350] focus:border-[#EF5350]' : 'border-[#D5D5D5] focus:border-[#2D9D4E]'}`}
                        placeholder="Ej: 150"
                      />
                      <select
                        value={newIngQtyUnit}
                        onChange={(e) => setNewIngQtyUnit(e.target.value as any)}
                        className="text-sm p-3 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:border-[#2D9D4E] outline-hidden h-[48px]"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                        <option value="unidades">unidades</option>
                      </select>
                    </div>
                    {ingFormErrors.qty && <p className="text-[11px] text-[#EF5350] font-medium">{ingFormErrors.qty}</p>}
                  </div>

                  {/* Días para caducar */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 tracking-wider">Días para caducar</label>
                    <input
                      type="number"
                      min="0"
                      value={newIngExpiry}
                      onChange={(e) => setNewIngExpiry(parseInt(e.target.value) || 0)}
                      className="w-full text-sm p-3 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:border-[#2D9D4E] outline-hidden"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 tracking-wider">Categoría</label>
                    <select
                      value={newIngCategory}
                      onChange={(e: any) => setNewIngCategory(e.target.value)}
                      className="w-full text-sm p-3 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:border-[#2D9D4E] outline-hidden h-[48px]"
                    >
                      <option value="Verduras">Verduras 🥕</option>
                      <option value="Carnes">Carnes 🍗</option>
                      <option value="Lácteos">Lácteos 🥛</option>
                      <option value="Granos">Granos 🌾</option>
                      <option value="Condimentos">Condimentos 🧂</option>
                      <option value="Otros">Otros ⚙</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t max-w-lg mx-auto w-full">
                  <button 
                    type="submit"
                    className="w-full bg-[#006b2d] hover:bg-[#005222] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
                  >
                    Agregar a despensa
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Simulation Drawer Modal for all viewports */}
      <AnimatePresence>
        {showSimPanelOnMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs z-[200] flex flex-col justify-end"
            onClick={() => setShowSimPanelOnMobile(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] p-6 space-y-6 w-full shadow-2xl max-w-md mx-auto h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
                <span className="flex items-center text-xs font-bold tracking-wider text-prepeasy-primary gap-2 font-sans">
                  <Sliders className="w-4 h-4 text-prepeasy-primary" /> Consola de simulación
                </span>
                <button 
                  onClick={() => setShowSimPanelOnMobile(false)}
                  className="text-stone-400 hover:text-stone-600 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100"
                >
                  ×
                </button>
              </div>

              {/* Scrollable controls list */}
              <div className="flex-1 overflow-y-auto py-2 space-y-5">
                <p className="text-xs text-stone-500 leading-relaxed">
                  Prueba de manera interactiva la experiencia de usuario de <b>PrepEasy</b> bajo diferentes estados simulados del dispositivo y la red.
                </p>

                {/* Server State */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 tracking-wider block">Estado de red</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setAppState('connected')}
                      className={`py-2 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-hidden ${
                        appState === 'connected' 
                          ? 'bg-prepeasy-primary text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5" /> Online
                    </button>
                    <button 
                      onClick={() => setAppState('offline')}
                      className={`py-2 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all outline-hidden ${
                        appState === 'offline' 
                          ? 'bg-prepeasy-error text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                      }`}
                    >
                      <WifiOff className="w-3.5 h-3.5" /> Offline
                    </button>
                  </div>
                </div>

                {/* Loading/Skeletons State */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 tracking-wider block">Fluctuación de carga</span>
                  <button 
                    onClick={() => {
                      setSkeletonLoading();
                      setShowSimPanelOnMobile(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 transition-all outline-hidden ${
                      appState === 'loading' 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-stone-500" /> Recrear Carga Skeletons (2s)
                  </button>
                </div>

                {/* Pantry State */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 tracking-wider block">Estado de despensa</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPantryIsEmpty(false)}
                      className={`py-2 px-3 rounded-xl font-bold text-[11px] transition-all outline-hidden ${
                        !pantryIsEmpty 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary border border-prepeasy-primary/30 shadow-xs' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
                      }`}
                    >
                      Con Alimentos
                    </button>
                    <button 
                      onClick={() => setPantryIsEmpty(true)}
                      className={`py-2 px-3 rounded-xl font-bold text-[11px] transition-all outline-hidden ${
                        pantryIsEmpty 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary border border-prepeasy-primary/30 shadow-xs' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
                      }`}
                    >
                      Vacía
                    </button>
                  </div>
                </div>

                {/* Edit Profile */}
                <div className="space-y-2 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-100">
                  <span className="text-[11px] font-bold text-stone-400 tracking-wider block">Perfil de usuario</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 w-full text-xs focus:ring-1 focus:ring-prepeasy-primary focus:border-prepeasy-primary outline-hidden font-medium"
                      placeholder="Nombre"
                    />
                    <button 
                      onClick={() => setAvatarIndex(prev => (prev + 1) % avatars.length)}
                      className="py-1.5 px-3 bg-white border border-stone-200 rounded-xl text-xs font-bold hover:bg-stone-50 text-stone-600 whitespace-nowrap active:scale-95 transition-all shrink-0"
                    >
                      Foto 👤
                    </button>
                  </div>
                </div>

                {/* Explanatory banner */}
                <div className="bg-[#D4F4DD]/50 p-3 rounded-2xl space-y-1 text-[11px] text-[#1F6B35] leading-relaxed border border-green-100/60 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse flex-shrink-0 mt-0.5" />
                  <span>
                    Elige <b>Despensa Vacía</b> para ver la pantalla de inducción en la pestaña de <b>Mi Despensa</b>.
                  </span>
                </div>
              </div>

              {/* Close Drawer button */}
              <div className="pt-4 border-t border-stone-100 shrink-0">
                <button 
                  onClick={() => setShowSimPanelOnMobile(false)}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  Cerrar Consola
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
