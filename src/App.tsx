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
  Search,
  ChevronDown,
  Zap,
  UtensilsCrossed,
  RefreshCw,
  CalendarDays,
  X,
  Heart
} from 'lucide-react';

import { Ingredient, Recipe, CookedHistory, AppState, ActiveTab, EnergyLevel, PlannerMode, PlannerStatus, WeeklyPlan, PlannedRecipe } from './types';
import { INITIAL_INGREDIENTS, ALL_RECIPES, INITIAL_HISTORY, INGREDIENT_IMAGES, CATEGORY_FALLBACK_IMAGES } from './data';

// Module-level plan cache — survives React StrictMode remounts and any re-render
let _weeklyPlanCache: import('./types').WeeklyPlan | null = null;
try { _weeklyPlanCache = JSON.parse(localStorage.getItem('weeklyPlan') ?? 'null'); } catch {}

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [appState, setAppState] = useState<AppState>('connected');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('low');
  
  // Dynamic Data Lists — ingredients persisted to localStorage, start empty on first visit
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('pantry_ingredients');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const saveIngredients = (updated: Ingredient[]) => {
    localStorage.setItem('pantry_ingredients', JSON.stringify(updated));
    setIngredients(updated);
  };
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

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') ?? '[]'); } catch { return []; }
  });
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };


  // Planner states
  const [plannerMode, setPlannerMode] = useState<PlannerMode>(() => {
    return (localStorage.getItem('plannerMode') as PlannerMode) ?? 'rapido';
  });
  const [weeklyPlanVersion, setWeeklyPlanVersion] = useState(0);
  const weeklyPlan = _weeklyPlanCache;
  const setWeeklyPlan = (plan: WeeklyPlan | null) => {
    _weeklyPlanCache = plan;
    if (plan) localStorage.setItem('weeklyPlan', JSON.stringify(plan));
    else localStorage.removeItem('weeklyPlan');
    setWeeklyPlanVersion(v => v + 1);
  };
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [showMissingIngredients, setShowMissingIngredients] = useState(false);
  const plannerStatus: PlannerStatus = plannerError ? 'error' : weeklyPlan?.recipes?.length ? 'ready' : 'empty';
  // IDs of ingredients present when plan was last generated — used to detect new expiring additions
  const [planIngredientIds, setPlanIngredientIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('planIngredientIds') ?? '[]'); } catch { return []; }
  });
  const [openrouterKey, setOpenrouterKey] = useState<string>(() => {
    const stored = localStorage.getItem('openrouter_api_key');
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const raw = stored ?? envKey ?? '';
    return raw === 'undefined' || raw === 'null' ? '' : raw;
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');

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
    const updatedIngredients = [newIng, ...ingredients];
    saveIngredients(updatedIngredients);
    setNewIngName('');
    setNewIngQtyAmount('');
    setNewIngQtyUnit('g');
    setIngFormErrors({});
    setShowAddIngredientModal(false);
    setPantryIsEmpty(false);

    setActiveTab('inicio');
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
    
    // Automatically remove used ingredients from pantry
    const updated = ingredients
      .map(i => {
        const matchesUsed = activeCookingRecipe.ingredientsNeeded.some(n => ingredientMatches(i.name, n.name));
        return matchesUsed ? { ...i, quantity: 'Consumido' } : i;
      })
      .filter(i => i.quantity !== 'Consumido');
    saveIngredients(updated);

    setActiveTab('favoritos');
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
      saveIngredients([...scanned, ...ingredients]);
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
    saveIngredients(ingredients.filter(i => i.id !== id));
  };

  // Helper function to see ingredients count match for a recipe
  const getIngredientMatchText = (recipe: Recipe) => {
    if (pantryIsEmpty) return { text: 'Te faltan ingredientes', style: 'text-prepeasy-error bg-red-50 border-red-100' };
    
    const needed = recipe.ingredientsNeeded.filter(n => n.required);
    const inPantryTotal = needed.filter(n =>
      ingredients.some(i => ingredientMatches(i.name, n.name))
    ).length;

    if (inPantryTotal === needed.length) {
      const expiring = ingredients.filter(i => i.expirationDays <= 3).length;
      const label = expiring > 0 ? `+${expiring} por vencer` : 'Tienes todo en casa';
      return { text: label, style: 'text-prepeasy-primary bg-prepeasy-primary-light border-green-200' };
    } else if (inPantryTotal > 0) {
      return { text: 'Tienes todo en casa', style: 'text-prepeasy-primary bg-prepeasy-primary-light border-green-200' };
    } else {
      return { text: 'Tienes todo en casa', style: 'text-prepeasy-primary bg-prepeasy-primary-light border-green-200' };
    }
  };

  const getIngredientImage = (ing: Ingredient): string => {
    const nameLower = ing.name.toLowerCase();
    const match = Object.keys(INGREDIENT_IMAGES).find(key => nameLower.includes(key));
    return match ? INGREDIENT_IMAGES[match] : CATEGORY_FALLBACK_IMAGES[ing.category];
  };

  // Normalizes Spanish ingredient names for comparison
  const cleanIngredient = (s: string) =>
    s.toLowerCase()
      .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
      .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ü/g,'u')
      .replace(/ñ/g,'n').replace(/[^a-z0-9 ]/g,'').trim();

  // Match helper: exact whole-word match only (avoids "champiñones" matching "piñones")
  const ingredientMatches = (pantryName: string, recipeName: string): boolean => {
    const p = cleanIngredient(pantryName);
    const r = cleanIngredient(recipeName);
    if (p === r) return true;
    const pWords = new Set(p.split(' ').filter(w => w.length > 3));
    const rWords = new Set(r.split(' ').filter(w => w.length > 3));
    for (const w of pWords) { if (rWords.has(w)) return true; }
    return false;
  };

  // For each recipe, dynamically compute which ingredients are in the pantry
  const recipesWithPantryStatus = recipes.map(recipe => ({
    ...recipe,
    ingredientsNeeded: recipe.ingredientsNeeded.map(ing => ({
      ...ing,
      inPantry: ingredients.some(pi => ingredientMatches(pi.name, ing.name))
    }))
  }));

  // Filtered and sorted recipes: prioritize those that use the most expiring ingredients
  const activeRecipes = recipesWithPantryStatus
    .filter(r => r.energyLevel === energyLevel)
    .map(recipe => {
      const expiringScore = ingredients.filter(ing =>
        ing.expirationDays <= 5 &&
        recipe.ingredientsNeeded.some(n => ingredientMatches(ing.name, n.name))
      ).length * 2;
      const pantryScore = recipe.ingredientsNeeded.filter(n => n.inPantry).length;
      return { ...recipe, _score: expiringScore + pantryScore };
    })
    .sort((a, b) => b._score - a._score);

  const generateWeeklyPlan = (mode: PlannerMode = plannerMode, priorityIngredients: string[] = []) => {
    if (ingredients.length === 0) return;
    setPlannerError(null);
    setShowMissingIngredients(false);

    try {
      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const pool = ALL_RECIPES.filter(r => {
        if (mode === 'rapido') return r.prepTime <= 20;
        if (mode === 'sin_apuro') return r.prepTime > 20 && r.prepTime <= 40;
        return r.prepTime > 30;
      });
      const scored = pool.map(r => {
        const expiringScore = ingredients.filter(i =>
          i.expirationDays <= 3 && r.ingredientsNeeded.some(n => ingredientMatches(i.name, n.name))
        ).length * 3;
        const pantryScore = r.ingredientsNeeded.filter(n =>
          ingredients.some(i => ingredientMatches(i.name, n.name))
        ).length;
        // Heavily boost recipes that use forced priority ingredients (from CTA)
        const priorityScore = priorityIngredients.filter(name =>
          r.ingredientsNeeded.some(n => ingredientMatches(name, n.name))
        ).length * 10;
        return { recipe: r, score: expiringScore + pantryScore + priorityScore };
      }).sort((a, b) => b.score - a.score);

      const picked = scored.slice(0, 5).map(s => s.recipe);
      if (picked.length < 5) {
        const extras = ALL_RECIPES.filter(r => !picked.find(p => p.id === r.id));
        picked.push(...extras.slice(0, 5 - picked.length));
      }

      const planned: WeeklyPlan = {
        recipes: days.map((day, i) => {
          const r = picked[i];
          const missing = r.ingredientsNeeded
            .filter(n => n.required && !ingredients.some(i => ingredientMatches(i.name, n.name)))
            .map(n => n.name);
          return { day, title: r.title, description: r.description, prepTime: r.prepTime, missingIngredients: missing };
        })
      };

      setWeeklyPlan(planned);
      localStorage.setItem('plannerMode', mode);
      const ids = ingredients.map(i => i.id);
      setPlanIngredientIds(ids);
      localStorage.setItem('planIngredientIds', JSON.stringify(ids));
    } catch (e) {
      setPlannerError(e instanceof Error ? e.message : String(e));
    }
  };

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
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-white z-[110] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-prepeasy-primary" />
                  <h1 className="font-serif text-2xl font-bold text-prepeasy-text-primary">Notificaciones</h1>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
                {!pantryIsEmpty ? (
                  <>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-prepeasy-warning shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-amber-900 text-sm">¿Día largo en la oficina?</span>
                        <p className="text-stone-600 text-sm">Tienes {expiringIngredientsCount} ingredientes próximos a caducar. Cocina algo con espinacas frescas hoy.</p>
                      </div>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-sm text-stone-600">
                      🥗 ¡Tu plan semanal va al día! Has cocinado 3 cenas caseras esta semana.
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-stone-500 p-4 rounded-2xl bg-neutral-50 text-center">
                    Tu despensa está vacía. Registra ingredientes para recibir alertas.
                  </div>
                )}
              </div>
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
                    onClick={() => setActiveTab('favoritos')}
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
                      setActiveTab('favoritos');
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
                    <span className="text-xs font-bold tracking-widest text-[#5E5E5E]">Modo offline activo</span>
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
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveCookingRecipe(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-prepeasy-primary bg-prepeasy-primary-light py-1.5 px-3 rounded-full hover:bg-opacity-80 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                    onClick={() => toggleFavorite(activeCookingRecipe.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${favorites.includes(activeCookingRecipe.id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-neutral-200 text-stone-400'}`}
                  >
                    <Heart className="w-5 h-5" fill={favorites.includes(activeCookingRecipe.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Recipe Hero banner */}
                <div className="rounded-3xl overflow-hidden relative shadow-md bg-stone-100">
                  <img
                    src={activeCookingRecipe.imageUrl}
                    alt={activeCookingRecipe.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-3.5 rounded-full text-xs font-bold text-prepeasy-text-primary shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-prepeasy-primary" /> {activeCookingRecipe.prepTime} min
                  </div>
                </div>

                {/* Header */}
                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-bold text-prepeasy-text-primary leading-tight">{activeCookingRecipe.title}</h2>
                  {/* Motivo de recomendación */}
                  {(() => {
                    const expiringMatches = ingredients.filter(i =>
                      i.expirationDays <= 3 && !pantryIsEmpty &&
                      activeCookingRecipe.ingredientsNeeded.some(n =>
                        ingredientMatches(i.name, n.name)
                      )
                    );
                    if (expiringMatches.length > 0) {
                      return <p className="text-sm text-prepeasy-text-secondary">Ideal para usar {expiringMatches.map(i => i.name.split(' ')[0]).join(' y ')} antes de que se echen a perder.</p>;
                    }
                    return <p className="text-sm text-prepeasy-text-secondary">Usa ingredientes de tu despensa en menos de {activeCookingRecipe.prepTime} minutos.</p>;
                  })()}
                </div>

                {/* Bloque de aprovechamiento */}
                {(() => {
                  const ingEmojis: Record<string, string> = {
                    espinaca: '🥬', aguacate: '🥑', tomate: '🍅', huevo: '🥚', pollo: '🍗',
                    platano: '🍌', plátano: '🍌', arroz: '🍚', salmon: '🐟', salmón: '🐟',
                    pasta: '🍝', zanahoria: '🥕', cebolla: '🧅', ajo: '🧄', limón: '🍋',
                    queso: '🧀', leche: '🥛', aceite: '🫙', mantequilla: '🧈', hongo: '🍄',
                    piñon: '🌰', piñones: '🌰', yogur: '🥛', seta: '🍄', setas: '🍄',
                    parmesano: '🧀', ricotta: '🧀', albahaca: '🌿'
                  };
                  const getEmoji = (name: string) => {
                    const key = Object.keys(ingEmojis).find(k => name.toLowerCase().includes(k));
                    return key ? ingEmojis[key] : '🌿';
                  };
                  const expiringMatches = ingredients.filter(i =>
                    i.expirationDays <= 3 && !pantryIsEmpty &&
                    activeCookingRecipe.ingredientsNeeded.some(n =>
                      ingredientMatches(i.name, n.name)
                    )
                  );
                  if (expiringMatches.length === 0) return null;
                  return (
                    <div className="bg-prepeasy-primary-light border border-green-200 rounded-2xl p-4 space-y-2.5">
                      <span className="text-sm font-bold text-prepeasy-primary flex items-center gap-1.5">🥬 Ingredientes que aprovecharás</span>
                      <div className="space-y-1.5">
                        {expiringMatches.map((ing, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-prepeasy-text-primary">
                            <span>{getEmoji(ing.name)}</span>
                            <span className="font-medium">{ing.name}</span>
                            <span className="text-xs text-stone-500">
                              {ing.expirationDays === 0 ? '· vence hoy' : ing.expirationDays === 1 ? '· vence mañana' : `· vence en ${ing.expirationDays} días`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Atributos */}
                <div className="flex flex-wrap gap-2">
                  {activeCookingRecipe.utensils.map((ut, idx) => (
                    <span key={idx} className="bg-prepeasy-surface-container border border-neutral-200/50 text-xs font-bold text-[#5E5E5E] py-1 px-2.5 rounded-lg flex items-center gap-1">
                      🍳 {ut}
                    </span>
                  ))}
                  <span className="bg-emerald-50 border border-emerald-100 text-xs font-bold text-prepeasy-primary py-1 px-2.5 rounded-lg">
                    {activeCookingRecipe.energyLevel === 'low' ? '⚡ Muy fácil' : activeCookingRecipe.energyLevel === 'balanced' ? '👌 Fácil' : '🧘 Poco esfuerzo'}
                  </span>
                </div>

                {/* Temporizador asociado al paso activo */}
                {(() => {
                  const nextStep = activeCookingRecipe.steps.find((_, i) => !completedSteps.includes(i));
                  const nextStepIdx = activeCookingRecipe.steps.findIndex((_, i) => !completedSteps.includes(i));
                  return (
                    <div className="bg-white p-4 rounded-2xl border border-prepeasy-surface-muted shadow-sm space-y-3">
                      {nextStep && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-stone-400 tracking-wider">PRÓXIMO PASO</span>
                          <p className="text-sm font-medium text-prepeasy-text-primary leading-snug line-clamp-2">{nextStep}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-center bg-prepeasy-bg p-3 rounded-xl border border-dashed border-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-4 h-4 text-prepeasy-primary ${isTimerRunning ? 'animate-pulse' : ''}`} />
                          <span className="text-xs font-bold text-prepeasy-primary-dark">Temporizador</span>
                        </div>
                        <div className="font-mono text-xl font-bold text-prepeasy-text-primary">
                          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startKitchenTimer(60)} className="flex-1 py-2 px-2 bg-white border border-stone-200 hover:border-prepeasy-primary text-xs font-medium rounded-xl">+1 min</button>
                        <button onClick={() => startKitchenTimer(300)} className="flex-1 py-2 px-2 bg-white border border-stone-200 hover:border-prepeasy-primary text-xs font-medium rounded-xl">+5 min</button>
                        <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl text-white ${isTimerRunning ? 'bg-amber-500' : 'bg-prepeasy-primary'}`}>
                          {isTimerRunning ? 'Pausar' : 'Iniciar'}
                        </button>
                      </div>
                      {timerSeconds === 0 && <p className="text-center text-xs font-bold text-prepeasy-error animate-bounce">🔔 ¡Listo! Pasa al siguiente paso.</p>}
                    </div>
                  );
                })()}

                {/* Ingredientes */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Lo que necesitas</h3>
                  <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
                    {activeCookingRecipe.ingredientsNeeded.map((ing, idx) => {
                      const ingEmojis: Record<string, string> = {
                        espinaca: '🥬', aguacate: '🥑', tomate: '🍅', huevo: '🥚', pollo: '🍗',
                        platano: '🍌', plátano: '🍌', arroz: '🍚', salmon: '🐟', salmón: '🐟',
                        pasta: '🍝', zanahoria: '🥕', cebolla: '🧅', ajo: '🧄', limón: '🍋',
                        queso: '🧀', leche: '🥛', aceite: '🫙', mantequilla: '🧈', hongo: '🍄',
                        piñon: '🌰', piñones: '🌰', yogur: '🥛', seta: '🍄', setas: '🍄',
                        parmesano: '🧀', ricotta: '🧀', albahaca: '🌿'
                      };
                      const getEmoji = (name: string) => {
                        const key = Object.keys(ingEmojis).find(k => name.toLowerCase().includes(k));
                        return key ? ingEmojis[key] : '🌿';
                      };
                      const pantryMatch = ingredients.find(i =>
                        ingredientMatches(i.name, ing.name)
                      );
                      const expiryLabel = pantryMatch
                        ? pantryMatch.expirationDays === 0 ? 'Vence hoy'
                          : pantryMatch.expirationDays === 1 ? 'Vence mañana'
                          : pantryMatch.expirationDays <= 3 ? `Vence en ${pantryMatch.expirationDays} días`
                          : null
                        : null;
                      return (
                        <div key={idx} className="px-3.5 py-3 flex items-center justify-between text-xs">
                          <span className="font-medium text-prepeasy-text-primary flex items-center gap-2">
                            <span>{getEmoji(ing.name)}</span>{ing.name}
                          </span>
                          <div className="flex flex-col items-end gap-0.5">
                            {ing.inPantry && !pantryIsEmpty ? (
                              <span className="bg-emerald-50 text-prepeasy-primary text-xs font-bold px-2 py-0.5 rounded border border-emerald-100">✓ En despensa</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded border border-amber-100">Necesitas comprar</span>
                            )}
                            {expiryLabel && <span className="text-[10px] text-red-500 font-medium">{expiryLabel}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pasos */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-prepeasy-text-secondary">Paso a paso</h3>
                  <div className="space-y-2">
                    {activeCookingRecipe.steps.map((step, idx) => {
                      const isCompleted = completedSteps.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isCompleted) {
                              setCompletedSteps(completedSteps.filter(s => s !== idx));
                            } else {
                              setCompletedSteps([...completedSteps, idx]);
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 select-none ${
                            isCompleted
                              ? 'bg-neutral-100/70 border-neutral-200/50 opacity-50'
                              : 'bg-white border-neutral-200/60 shadow-xs hover:border-prepeasy-primary'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                            isCompleted ? 'bg-prepeasy-primary border-prepeasy-primary text-white' : 'border-stone-300 bg-white text-stone-500'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          <span className={`text-sm leading-relaxed ${isCompleted ? 'line-through text-stone-400' : 'text-prepeasy-text-primary'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bloque final — recompensa */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col items-center text-center space-y-3">
                  <span className="text-2xl">🎉</span>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-prepeasy-text-primary">¡Buen trabajo!</h4>
                    <p className="text-sm text-prepeasy-text-secondary">Usaste ingredientes de tu despensa y evitaste desperdiciarlos.</p>
                  </div>
                  <button
                    onClick={finishCooking}
                    className="w-full bg-prepeasy-primary hover:bg-prepeasy-primary-dark text-white rounded-xl py-3 px-6 text-sm font-bold transition-all shadow-sm"
                  >
                    Actualizar despensa
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
                className="py-4 space-y-3"
              >
                
                {/* Greeting Header */}
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight" id="greeting-title">
                    ¿Qué cocinamos hoy?
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
                    const expiringCount = ingredients.filter(i => i.expirationDays <= 3).length;
                    const difficultyLabel = recipe.energyLevel === 'low' ? 'Fácil' : recipe.energyLevel === 'balanced' ? 'Medio' : 'Elaborado';
                    const visibleIngredients = recipe.ingredientsNeeded.slice(0, 2);
                    const extraCount = recipe.ingredientsNeeded.length - 2;
                    const ingredientEmojis: Record<string, string> = {
                      espinaca: '🥬', aguacate: '🥑', tomate: '🍅', huevo: '🥚', pollo: '🍗',
                      arroz: '🍚', salmon: '🐟', salmón: '🐟', pasta: '🍝', zanahoria: '🥕',
                      cebolla: '🧅', ajo: '🧄', limón: '🍋', queso: '🧀', leche: '🥛',
                      aceite: '🫙', sal: '🧂', mantequilla: '🧈', hongo: '🍄', calabacín: '🥒'
                    };
                    const getIngEmoji = (name: string) => {
                      const key = Object.keys(ingredientEmojis).find(k => name.toLowerCase().includes(k));
                      return key ? ingredientEmojis[key] : '🌿';
                    };
                    return (
                      <div
                        key={recipe.id}
                        onClick={() => { setSelectedRecipe(recipe); setActiveCookingRecipe(recipe); }}
                        className="w-72 bg-white rounded-3xl overflow-hidden border border-neutral-100 flex-shrink-0 snap-center shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                      >
                        {/* Image */}
                        <div className="relative">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full text-xs font-bold text-stone-800 shadow-xs flex items-center gap-1">
                            <Clock className="w-3 h-3 text-prepeasy-primary" /> {recipe.prepTime} min
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all ${favorites.includes(recipe.id) ? 'bg-white text-red-500' : 'bg-white/80 text-stone-400'}`}
                          >
                            <Heart className="w-4 h-4" fill={favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Card content */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-2.5">
                            {/* Title */}
                            <h3 className="font-serif text-lg font-bold text-prepeasy-text-primary leading-snug">{recipe.title}</h3>

                            {/* Expiring tag — solo si hay ingredientes por vencer */}
                            {index === 0 && expiringCount > 0 && !pantryIsEmpty && (
                              <span className="inline-flex items-center text-xs font-bold text-amber-700">
                                Aprovecha {expiringCount} ingrediente{expiringCount > 1 ? 's' : ''} por vencer
                              </span>
                            )}

                            {/* Ingredient chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {visibleIngredients.map((ing, i) => (
                                <span key={i} className="text-xs font-medium py-0.5 px-2 rounded-md bg-[#EEF1ED] text-stone-600 border border-[#E2EBE0]">
                                  {getIngEmoji(ing.name)} {ing.name}
                                </span>
                              ))}
                              {extraCount > 0 && (
                                <span className="text-xs font-medium py-0.5 px-2 rounded-md bg-[#EEF1ED] text-stone-500 border border-[#E2EBE0]">
                                  +{extraCount} más
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecipe(recipe);
                              setActiveCookingRecipe(recipe);
                            }}
                            className="w-full bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-2xl py-3 px-4 text-sm font-bold transition-all flex items-center justify-center shadow-xs"
                          >
                            Cocinar ahora
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
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-prepeasy-error rounded-full text-xs font-bold text-white flex items-center justify-center animate-bounce">
                          {expiringIngredientsCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-prepeasy-text-primary font-sans">Revisar Mi Despensa</h4>
                      <p className="text-xs text-[#5E5E5E] mt-0.5">
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
                    <p className="text-xs text-stone-500 mt-1">Los ingredientes que tienes en casa.</p>
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
                          <span className="text-xs font-mono font-bold text-prepeasy-primary mt-1 opacity-80">Hoja de albahaca</span>
                        </div>
                      </div>

                      {/* Heading matches Screen 2 precisely */}
                      <h3 className="font-serif text-lg font-bold text-[#1F6B35] text-center mt-4">Tu despensa está vacía</h3>
                      <p className="text-xs text-stone-500 text-center leading-relaxed max-w-xs mt-1">
                        Registra los ingredientes que tienes en casa para que podamos recomendarte cenas rápidas sin salir a comprar.
                      </p>

                      <button 
                        onClick={() => setShowAddIngredientModal(true)}
                        className="mt-6 bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-full py-3.5 px-6 text-sm font-bold transition-all shadow-md hover:shadow-lg w-full flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" /> Agregar ingredientes ahora
                      </button>
                      
                      <span className="text-xs tracking-wider font-bold text-[#A8A8A8] mt-3">Toma solo 2 minutos</span>
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
                          <p className="text-xs text-[#5E5E5E] mt-0.5">Importa todo automáticamente</p>
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
                      <Camera className="w-4 h-4" /> Escanear recibo
                    </button>

                    {/* Active list display */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-3 space-y-2 divide-y divide-neutral-50 shadow-xs">
                      {ingredients.map((ing) => {
                        const isExpiringToday = ing.expirationDays === 0;
                        const isExpiringTomorrow = ing.expirationDays === 1;
                        const isExpiringIn2 = ing.expirationDays === 2;
                        const isNearing = ing.expirationDays <= 2;
                        
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
                                <h4 className="text-sm font-semibold text-prepeasy-text-primary">{ing.name}</h4>
                                <div className="flex gap-1.5 items-center mt-0.5">
                                  <span className="text-xs text-stone-500 font-mono">{ing.quantity}</span>
                                  <span className="text-stone-300">•</span>
                                  <span className={`text-xs font-bold flex items-center gap-1 ${
                                    isExpiringToday ? 'text-prepeasy-error' : isNearing ? 'text-amber-600' : 'text-stone-500'
                                  }`}>
                                    {isExpiringToday && <><span>🔴</span> Vence hoy</>}
                                    {isExpiringTomorrow && <><span>🟠</span> Vence mañana</>}
                                    {isExpiringIn2 && <><span>🟡</span> Vence en 2 días</>}
                                    {!isNearing && `Vence en ${ing.expirationDays} días`}
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

                    <p className="text-xs text-center text-stone-400">Deslice hacia la izquierda o haga clic en el bote para eliminar existencias consumidas manualmente.</p>
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
                {/* Header */}
                <div>
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Planificador</h1>
                  <p className="text-xs text-stone-500 mt-1">IA genera tu semana con lo que tienes en casa. v2</p>
                </div>


                {/* Mode selector */}
                <div className="flex gap-2">
                  {([
                    { id: 'rapido', label: '⚡ Algo rápido' },
                    { id: 'sin_apuro', label: '⏱ Sin apuro' },
                    { id: 'me_luzco', label: '✨ Hoy me luzco' }
                  ] as { id: PlannerMode; label: string }[]).map(m => (
                    <button
                      key={m.id}
                      onClick={() => { if (m.id !== plannerMode) { setPlannerMode(m.id); setPlannerError(null); if (weeklyPlan) generateWeeklyPlan(m.id); } }}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                        plannerMode === m.id
                          ? 'bg-prepeasy-primary text-white border-prepeasy-primary'
                          : 'bg-white text-prepeasy-text-secondary border-neutral-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Empty state */}
                {plannerStatus === 'empty' && (
                  <div className="flex flex-col items-center text-center gap-4 py-10">
                    <div className="w-16 h-16 rounded-2xl bg-prepeasy-primary-light flex items-center justify-center">
                      <CalendarDays className="w-8 h-8 text-prepeasy-primary" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-serif text-xl font-bold text-prepeasy-text-primary">Sin plan esta semana</h2>
                      <p className="text-xs text-stone-500 max-w-[220px]">
                        {ingredients.length === 0
                          ? 'Agrega ingredientes a tu despensa primero.'
                          : 'Genera tu plan de cenas personalizado con lo que tienes en casa.'}
                      </p>
                    </div>
                    {ingredients.length > 0 && (
                      <button
                        onClick={generateWeeklyPlan}
                        className="bg-prepeasy-primary text-white font-bold text-sm py-3 px-6 rounded-xl w-full transition-all active:scale-95"
                      >
                        Planificar mi semana
                      </button>
                    )}
                    {ingredients.length === 0 && (
                      <button
                        onClick={() => setActiveTab('despensa')}
                        className="bg-prepeasy-primary text-white font-bold text-sm py-3 px-6 rounded-xl w-full transition-all active:scale-95"
                      >
                        Ir a mi despensa
                      </button>
                    )}
                  </div>
                )}

                {/* Loading state — skeleton cards */}
                {plannerStatus === 'loading' && (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-500 text-center animate-pulse">Generando tu plan con IA...</p>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-4 space-y-2 animate-pulse">
                        <div className="h-3 w-16 bg-stone-200 rounded-full" />
                        <div className="h-4 w-4/5 bg-stone-200 rounded-full" />
                        <div className="h-3 w-3/5 bg-stone-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error state */}
                {plannerStatus === 'error' && (
                  <div className="flex flex-col items-center text-center gap-4 py-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="w-full space-y-3">
                      <div className="space-y-1">
                        <h2 className="font-serif text-xl font-bold text-prepeasy-text-primary">Algo salió mal</h2>
                        <p className="text-xs text-stone-500">No pudimos generar tu plan. Intenta de nuevo.</p>
                        {plannerError && <p className="text-xs text-red-400 font-mono break-all mt-1">{plannerError}</p>}
                      </div>
                      <button
                        onClick={generateWeeklyPlan}
                        className="bg-prepeasy-primary text-white font-bold text-sm py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4" /> Reintentar
                      </button>
                    </div>
                  </div>
                )}

                {/* Ready state — 5 recipe cards */}
                {plannerStatus === 'ready' && weeklyPlan && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-prepeasy-text-secondary tracking-wider">Tu semana</h3>
                      <button
                        onClick={generateWeeklyPlan}
                        className="flex items-center gap-1 text-xs font-bold text-prepeasy-primary"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerar
                      </button>
                    </div>

                    {/* CTA: new expiring ingredients added after plan was generated */}
                    {(() => {
                      const newExpiring = ingredients.filter(i =>
                        i.expirationDays <= 7 &&
                        !pantryIsEmpty &&
                        !planIngredientIds.includes(i.id) &&
                        ALL_RECIPES.some(ar => ar.ingredientsNeeded.some(n => ingredientMatches(i.name, n.name)))
                      );
                      if (newExpiring.length === 0) return null;
                      return (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold text-amber-900">
                              {newExpiring.length === 1
                                ? `Agregaste "${newExpiring[0].name}" — vence pronto, ¿incluirlo en tu plan?`
                                : `Agregaste ${newExpiring.length} ingredientes que vencen pronto`}
                            </p>
                            <button
                              onClick={() => generateWeeklyPlan(plannerMode, newExpiring.map(i => i.name))}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
                            >
                              Recalcular recetas incluyéndolos
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Expiring ingredients summary card */}
                    {(() => {
                      const allExpiring = Array.from(new Map(
                        ingredients.filter(i => i.expirationDays <= 3 && !pantryIsEmpty).map(i => [i.name.toLowerCase(), i])
                      ).values());
                      // Only show expiring ingredients that are actually used in the current plan
                      const expiring = allExpiring.filter(ing =>
                        weeklyPlan.recipes.some(r =>
                          ALL_RECIPES.find(ar => ar.title === r.title)?.ingredientsNeeded.some(n => ingredientMatches(ing.name, n.name))
                        )
                      );
                      if (expiring.length === 0) return null;
                      const ingEmojis: Record<string, string> = {
                        espinaca: '🥬', aguacate: '🥑', tomate: '🍅', huevo: '🥚', pollo: '🍗',
                        platano: '🍌', plátano: '🍌', arroz: '🍚', salmon: '🐟', salmón: '🐟',
                        pasta: '🍝', zanahoria: '🥕', cebolla: '🧅', ajo: '🧄', limón: '🍋',
                        queso: '🧀', leche: '🥛', aceite: '🫙', mantequilla: '🧈', hongo: '🍄'
                      };
                      const getEmoji = (name: string) => {
                        const key = Object.keys(ingEmojis).find(k => name.toLowerCase().includes(k));
                        return key ? ingEmojis[key] : '🌿';
                      };
                      return (
                        <div className="bg-prepeasy-primary-light border border-green-200 rounded-2xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-prepeasy-text-primary leading-snug">
                            Aprovecharás <span className="text-prepeasy-primary font-bold">{expiring.length} ingrediente{expiring.length > 1 ? 's' : ''}</span> que vencen pronto
                          </p>
                          <div className="space-y-1.5">
                            {expiring.map((ing, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-prepeasy-text-secondary">
                                <span>{getEmoji(ing.name)}</span>
                                <span>{ing.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-3">
                      {weeklyPlan.recipes.map((planned, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          onClick={() => {
                            const match = recipesWithPantryStatus.find(r =>
                              r.title.toLowerCase().includes(planned.title.toLowerCase().split(' ')[0])
                            ) ?? recipesWithPantryStatus[idx % recipesWithPantryStatus.length];
                            setActiveCookingRecipe(match);
                          }}
                          className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-start justify-between gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                        >
                          <div className="flex-1 space-y-2">
                            <span className="text-xs font-bold text-prepeasy-primary tracking-wider uppercase">{planned.day}</span>
                            <h4 className="font-serif font-bold text-stone-800 text-base leading-tight">{planned.title}</h4>
                            {(() => {
                              const expiring = ingredients.filter(i => i.expirationDays <= 3 && !pantryIsEmpty);
                              const ingEmojis: Record<string, string> = {
                                espinaca: '🥬', aguacate: '🥑', tomate: '🍅', huevo: '🥚', pollo: '🍗',
                                platano: '🍌', plátano: '🍌', arroz: '🍚', salmon: '🐟', salmón: '🐟',
                                pasta: '🍝', zanahoria: '🥕', cebolla: '🧅', ajo: '🧄', limón: '🍋',
                                queso: '🧀', leche: '🥛', aceite: '🫙', mantequilla: '🧈', hongo: '🍄'
                              };
                              const getEmoji = (name: string) => {
                                const key = Object.keys(ingEmojis).find(k => name.toLowerCase().includes(k));
                                return key ? ingEmojis[key] : '🌿';
                              };
                              const recipeData = ALL_RECIPES.find(ar => ar.title === planned.title);
                              const matched = expiring.filter(i =>
                                recipeData?.ingredientsNeeded.some(n => ingredientMatches(i.name, n.name))
                              );
                              if (matched.length === 0) return null;
                              return (
                                <div className="space-y-1">
                                  <span className="text-xs text-stone-400 font-medium">Aprovecha:</span>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {matched.map((ing, i) => (
                                      <span key={i} className="text-xs text-stone-600 flex items-center gap-1">
                                        {getEmoji(ing.name)} {ing.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              <span className="text-xs text-stone-400">{planned.prepTime} min</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-300 mt-1 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Missing ingredients collapsible */}
                    {weeklyPlan.recipes.some(r => r.missingIngredients.length > 0) && (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setShowMissingIngredients(v => !v)}
                          className="w-full flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-amber-700">Ingredientes que te faltan</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${showMissingIngredients ? 'rotate-180' : ''}`} />
                        </button>
                        {showMissingIngredients && (
                          <div className="px-4 pb-4 space-y-1">
                            {Array.from(new Set(weeklyPlan.recipes.flatMap(r => r.missingIngredients))).map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            ) :

            /* VIEW: HISTORIAL TAB */
            activeTab === 'favoritos' ? (
              <motion.div
                key="favoritos-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6"
              >
                <div>
                  <h1 className="font-serif text-3xl font-bold text-prepeasy-text-primary tracking-tight">Mis favoritos</h1>
                  <p className="text-xs text-stone-500 mt-1">Las recetas que más te gustan, siempre a la mano.</p>
                </div>

                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-4 py-14">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-red-300" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-serif text-xl font-bold text-prepeasy-text-primary">Sin favoritos aún</h2>
                      <p className="text-xs text-stone-500 max-w-[220px]">Toca el corazón en cualquier receta para guardarla aquí.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('recetas')}
                      className="bg-prepeasy-primary text-white font-bold text-sm py-3 px-6 rounded-xl w-full transition-all active:scale-95"
                    >
                      Explorar recetas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipesWithPantryStatus.filter(r => favorites.includes(r.id)).map(recipe => (
                      <div
                        key={recipe.id}
                        className="bg-white border border-neutral-100 rounded-2xl overflow-hidden flex shadow-xs"
                      >
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-24 h-24 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <h4 className="font-serif font-bold text-stone-800 text-sm leading-snug">{recipe.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-stone-400">
                              <Clock className="w-3 h-3" /> {recipe.prepTime} min
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setActiveCookingRecipe(recipe)}
                              className="flex-1 bg-prepeasy-primary text-white text-xs font-bold py-2 rounded-xl transition-all"
                            >
                              Cocinar ahora
                            </button>
                            <button
                              onClick={() => toggleFavorite(recipe.id)}
                              className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500"
                            >
                              <Heart className="w-4 h-4" fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    className="flex items-center gap-1.5 text-xs font-bold text-prepeasy-primary bg-prepeasy-primary-light py-1.5 px-3.5 rounded-full hover:bg-opacity-80 transition-all self-start"
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
                    const filtered = recipesWithPantryStatus.filter(r => {
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
                            className="bg-prepeasy-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all"
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
                              <div className="relative h-44 bg-stone-50">
                                <img
                                  src={recipe.imageUrl}
                                  alt={recipe.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full text-xs font-bold text-stone-800 shadow-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-prepeasy-primary" /> {recipe.prepTime} min netos
                                </div>
                                <button
                                  onClick={() => toggleFavorite(recipe.id)}
                                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all ${favorites.includes(recipe.id) ? 'bg-white text-red-500' : 'bg-white/80 text-stone-400'}`}
                                >
                                  <Heart className="w-4 h-4" fill={favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                                </button>
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-serif text-lg font-bold text-prepeasy-text-primary leading-tight">{recipe.title}</h3>
                                    <span className={`text-xs font-bold py-0.5 px-2 rounded-md border shrink-0 ${match.style}`}>
                                      {match.text}
                                    </span>
                                  </div>
                                  <p className="text-xs text-prepeasy-text-secondary leading-relaxed">{recipe.description}</p>
                                
                                  {/* Badges */}
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="bg-[#EEF1ED] text-stone-600 text-xs font-bold py-0.5 px-2 rounded-md border border-[#EEF1ED]">
                                      {recipe.energyLevel === 'low' ? 'Algo rápido ⚡' : recipe.energyLevel === 'balanced' ? 'Equilibrado ⚖️' : 'Hoy me luzco ✨'}
                                    </span>
                                    {recipe.utensils.map((ut, idx) => (
                                      <span key={idx} className="bg-stone-50 text-stone-500 text-xs font-bold py-0.5 px-2 rounded-md border border-stone-200/50">
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
                                  className="w-full bg-[#006b2d] hover:bg-prepeasy-primary-dark text-white rounded-2xl py-3 px-4 text-sm font-bold transition-all flex items-center justify-center shadow-xs"
                                >
                                  Cocinar ahora
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
            onClick={() => { setActiveTab('inicio'); setSelectedRecipe(null); setActiveCookingRecipe(null); }}
            className="flex flex-col items-center justify-center space-y-1 relative group w-16"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'inicio' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <svg className="w-5 h-5 text-prepeasy-primary-dark z-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
                <span className="text-xs font-bold text-prepeasy-primary-dark z-10">Inicio</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
                <span className="text-xs font-medium text-stone-500">Inicio</span>
              </>
            )}
          </button>

          {/* Item 2: Mi Despensa */}
          <button
            onClick={() => { setActiveTab('despensa'); setSelectedRecipe(null); setActiveCookingRecipe(null); }}
            className="flex flex-col items-center justify-center space-y-1 relative group w-[75px]"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'despensa' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <ShoppingBag className="w-5 h-5 text-prepeasy-primary-dark z-10" />
                <span className="text-xs font-bold text-prepeasy-primary-dark z-10">Mi Despensa</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-xs font-medium text-stone-500">Mi Despensa</span>
              </>
            )}
          </button>

          {/* Item 3: Planificador */}
          <button
            onClick={() => { setActiveTab('planificador'); setSelectedRecipe(null); setActiveCookingRecipe(null); }}
            className="flex flex-col items-center justify-center space-y-1 relative group w-[75px]"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'planificador' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <BookOpen className="w-5 h-5 text-prepeasy-primary-dark z-10" />
                <span className="text-xs font-bold text-prepeasy-primary-dark z-10">Planificador</span>
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-xs font-medium text-stone-500">Planificador</span>
              </>
            )}
          </button>

          {/* Item 4: Favoritos */}
          <button
            onClick={() => { setActiveTab('favoritos'); setSelectedRecipe(null); setActiveCookingRecipe(null); }}
            className="flex flex-col items-center justify-center space-y-1 relative group w-16"
            style={{ minHeight: '48px' }}
          >
            {activeTab === 'favoritos' ? (
              <>
                <div className="absolute top-0 w-12 h-10 bg-[#a4f2ad]/70 rounded-full flex items-center justify-center -z-0"></div>
                <Heart className="w-5 h-5 text-prepeasy-primary-dark z-10" fill="currentColor" />
                <span className="text-xs font-bold text-prepeasy-primary-dark z-10">Favoritos</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 text-stone-500 hover:text-prepeasy-primary" />
                <span className="text-xs font-medium text-stone-500">Favoritos</span>
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
                <div className="flex justify-between items-center pb-4">
                  <h3 className="font-serif font-bold text-stone-800 text-3xl">Añadir Ingrediente</h3>
                  <button
                    type="button"
                    onClick={() => { setShowAddIngredientModal(false); setIngFormErrors({}); }}
                    className="text-stone-400 hover:text-stone-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable form body context */}
                <div className="flex-1 py-6 px-1 space-y-6 overflow-y-auto max-w-lg mx-auto w-full">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 tracking-wider">Nombre del alimento</label>
                    <input
                      type="text"
                      value={newIngName}
                      onChange={(e) => { setNewIngName(e.target.value); setIngFormErrors(prev => ({ ...prev, name: undefined })); }}
                      className={`w-full text-sm p-3 bg-[#F7F9F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-prepeasy-primary border ${ingFormErrors.name ? 'border-[#EF5350]' : 'border-[#D5D5D5]'}`}
                      placeholder="Ej: Aguacate maduro"
                    />
                    {ingFormErrors.name && <p className="text-xs text-[#EF5350] font-medium">{ingFormErrors.name}</p>}
                  </div>

                  {/* Cantidad + Unidad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 tracking-wider">Cantidad</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={newIngQtyAmount}
                        onChange={(e) => { setNewIngQtyAmount(e.target.value === '' ? '' : Number(e.target.value)); setIngFormErrors(prev => ({ ...prev, qty: undefined })); }}
                        className={`flex-1 text-sm py-3 pl-3 pr-3 bg-[#F7F9F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-prepeasy-primary border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${ingFormErrors.qty ? 'border-[#EF5350]' : 'border-[#D5D5D5]'}`}
                        placeholder="Ej: 150"
                      />
                      <div className="relative">
                        <select
                          value={newIngQtyUnit}
                          onChange={(e) => setNewIngQtyUnit(e.target.value as any)}
                          className="appearance-none text-sm py-3 pl-3 pr-8 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-prepeasy-primary h-[48px] w-24"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="unidades">un.</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      </div>
                    </div>
                    {ingFormErrors.qty && <p className="text-xs text-[#EF5350] font-medium">{ingFormErrors.qty}</p>}
                  </div>

                  {/* Días para caducar */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 tracking-wider">Días para caducar</label>
                    <input
                      type="number"
                      min="0"
                      value={newIngExpiry}
                      onChange={(e) => setNewIngExpiry(parseInt(e.target.value) || 0)}
                      className="w-full text-sm p-3 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-prepeasy-primary"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 tracking-wider">Categoría</label>
                    <div className="relative">
                      <select
                        value={newIngCategory}
                        onChange={(e: any) => setNewIngCategory(e.target.value)}
                        className="appearance-none w-full text-sm py-3 pl-3 pr-8 bg-[#F7F9F6] border border-[#D5D5D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-prepeasy-primary h-[48px]"
                      >
                        <option value="Verduras">Verduras 🥕</option>
                        <option value="Carnes">Carnes 🍗</option>
                        <option value="Lácteos">Lácteos 🥛</option>
                        <option value="Granos">Granos 🌾</option>
                        <option value="Condimentos">Condimentos 🧂</option>
                        <option value="Otros">Otros ⚙</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 max-w-lg mx-auto w-full">
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
                  <span className="text-xs font-bold text-stone-400 tracking-wider block">Estado de red</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setAppState('connected')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all outline-hidden ${
                        appState === 'connected' 
                          ? 'bg-prepeasy-primary text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5" /> Online
                    </button>
                    <button 
                      onClick={() => setAppState('offline')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all outline-hidden ${
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
                  <span className="text-xs font-bold text-stone-400 tracking-wider block">Fluctuación de carga</span>
                  <button 
                    onClick={() => {
                      setSkeletonLoading();
                      setShowSimPanelOnMobile(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all outline-hidden ${
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
                  <span className="text-xs font-bold text-stone-400 tracking-wider block">Estado de despensa</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPantryIsEmpty(false)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all outline-hidden ${
                        !pantryIsEmpty 
                          ? 'bg-prepeasy-primary-light text-prepeasy-primary border border-prepeasy-primary/30 shadow-xs' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200/70'
                      }`}
                    >
                      Con Alimentos
                    </button>
                    <button 
                      onClick={() => setPantryIsEmpty(true)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all outline-hidden ${
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
                  <span className="text-xs font-bold text-stone-400 tracking-wider block">Perfil de usuario</span>
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
                <div className="bg-[#D4F4DD]/50 p-3 rounded-2xl space-y-1 text-xs text-[#1F6B35] leading-relaxed border border-green-100/60 flex items-start gap-1.5">
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
