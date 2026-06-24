/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient, Recipe, CookedHistory } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Espinacas frescas', category: 'Verduras', expirationDays: 0, quantity: '150g' }, // expired/expiring today
  { id: '2', name: 'Aguacate maduro', category: 'Verduras', expirationDays: 1, quantity: '1 ud' }, // expiring in 1 day
  { id: '3', name: 'Huevo campero', category: 'Carnes', expirationDays: 2, quantity: '6 uds' }, // expiring in 2 days
  { id: '4', name: 'Pechuga de pollo', category: 'Carnes', expirationDays: 5, quantity: '400g' },
  { id: '5', name: 'Tomate cherry', category: 'Verduras', expirationDays: 4, quantity: '200g' },
  { id: '6', name: 'Yogur griego', category: 'Lácteos', expirationDays: 3, quantity: '2 uds' },
  { id: '7', name: 'Arroz arborio', category: 'Granos', expirationDays: 180, quantity: '500g' },
  { id: '8', name: 'Parmesano', category: 'Lácteos', expirationDays: 14, quantity: '100g' },
  { id: '9', name: 'Aceite de oliva virgen extra', category: 'Condimentos', expirationDays: 365, quantity: '1L' }
];

export const ALL_RECIPES: Recipe[] = [
  // LOW ENERGY (Sin energía) - Cenes rápidas, máximo 15 minutos, 1 utensilio
  {
    id: 'rec_1',
    title: 'Ensalada tibia de espinacas y aguacate',
    description: 'Una combinación reconstituyente con aguacate cremoso, espinacas tiernas salteadas ligeramente y piñones tostados. Rica en hierro y grasas saludables.',
    prepTime: 12,
    energyLevel: 'low',
    utensils: ['1 sartén'],
    ingredientsNeeded: [
      { name: 'Espinacas frescas', required: true, inPantry: true },
      { name: 'Aguacate maduro', required: true, inPantry: true },
      { name: 'Piñones o frutos secos', required: false, inPantry: true },
      { name: 'Aceite de oliva virgen extra', required: true, inPantry: true }
    ],
    steps: [
      'Lava las espinacas frescas y sécalas bien.',
      'Calienta una sartén con un chorrito de aceite de oliva a fuego medio-alto.',
      'Añade las espinacas y saltéalas rápidamente durante 1-2 minutos para que pierdan volumen pero mantengan el color verde vibrante.',
      'Corta el aguacate por la mitad, retira el hueso y saca tiras finas con la ayuda de una cuchara.',
      'Saca las espinacas calientes, colócalas en un plato hondo con el aguacate por encima.',
      'Adereza con una pizca de sal, limón y frutos secos tostados rápidos en la misma sartén.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rec_2',
    title: 'Revuelto rápido de espinacas y huevo',
    description: 'Proteínas limpias listas en un abrir y cerrar de ojos. Sabor reconfortante ideal para antes de dormir.',
    prepTime: 8,
    energyLevel: 'low',
    utensils: ['1 sartén'],
    ingredientsNeeded: [
      { name: 'Huevo campero', required: true, inPantry: true },
      { name: 'Espinacas frescas', required: true, inPantry: true },
      { name: 'Aceite de oliva virgen extra', required: true, inPantry: true }
    ],
    steps: [
      'Saltea las espinacas con un chorrito de aceite de oliva en una sartén durante 1 minuto.',
      'Bate dos huevos con una pizca de sal en una taza.',
      'Vierte los huevos sobre la sartén bajando el fuego al mínimo.',
      'Remueve constantemente con espátula de silicona durante 2 minutos hasta conseguir una textura cremosa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rec_3',
    title: 'Crema templada de calabacín y albahaca',
    description: 'Sopa ligera con calabacín sutilmente dulce y albahaca fresca. Ideal para calmar el cuerpo.',
    prepTime: 15,
    energyLevel: 'low',
    utensils: ['1 olla'],
    ingredientsNeeded: [
      { name: 'Calabacín', required: true, inPantry: false },
      { name: 'Hojas de albahaca', required: true, inPantry: true },
      { name: 'Yogur griego (para texturizar)', required: false, inPantry: true }
    ],
    steps: [
      'Pica el calabacín sin pelar en rodajas finas.',
      'Cocínalo al vapor o en olla con un vaso de agua por 10 minutos.',
      'Añade las hojas de albahaca, una cucharada de yogur griego, sal y pimienta.',
      'Tritura todo hasta que quede una textura sedosa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600'
  },

  // BALANCED ENERGY (Equilibrado) - Platos con proteínas completas y vegetales, 15-20 minutos
  {
    id: 'rec_4',
    title: 'Pechuga de pollo al sésamo con brócoli',
    description: 'Pechuga marinada jugosa cocinada a la plancha sobre un colchón de ramilletes de brócoli al dente.',
    prepTime: 20,
    energyLevel: 'balanced',
    utensils: ['1 sartén'],
    ingredientsNeeded: [
      { name: 'Pechuga de pollo', required: true, inPantry: true },
      { name: 'Brócoli fresco', required: true, inPantry: false },
      { name: 'Semillas de sésamo', required: false, inPantry: true },
      { name: 'Aceite de oliva virgen extra', required: true, inPantry: true }
    ],
    steps: [
      'Corta la pechuga de pollo en tiras de tamaño similar y sazona.',
      'Corta ramilletes pequeños de brócoli y saltéalos en la sartén tapada con un chorrito de agua para que se cocinen al vapor durante 5 minutos.',
      'Retira el brócoli y dora las tiras de pollo a fuego fuerte por 6-8 minutos.',
      'Junta todo en la sartén, vierte semillas de sésamo y saltea un minuto final.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rec_5',
    title: 'Salmón al vapor con costra de hierbas',
    description: 'Pescado graso premium cocinado de forma limpia con una costra aromática de eneldo, limón y pan rallado.',
    prepTime: 18,
    energyLevel: 'balanced',
    utensils: ['1 bandeja'],
    ingredientsNeeded: [
      { name: 'Lomo de salmón', required: true, inPantry: false },
      { name: 'Hierbas provenzales', required: true, inPantry: true },
      { name: 'Limon', required: true, inPantry: false }
    ],
    steps: [
      'Precalienta el horno a 180°C o prepara un estuche de silicona para microondas.',
      'Pincela el salmón con aceite de oliva, exprime limón y cubre con hierbas aromáticas mixtas.',
      'Cocina al horno durante 12 minutos o en microondas durante 4 minutos a máxima potencia.',
      'Sirve caliente acompañado de tomates cherry frescos de tu despensa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rec_6',
    title: 'Pasta integral con tomate cherry y ricotta',
    description: 'Carbohidratos de absorción lenta con la jugosidad ácida de tomates cherry asados y ricotta espesa.',
    prepTime: 15,
    energyLevel: 'balanced',
    utensils: ['1 olla'],
    ingredientsNeeded: [
      { name: 'Pasta integral', required: true, inPantry: false },
      { name: 'Tomate cherry', required: true, inPantry: true },
      { name: 'Queso ricotta o requesón', required: true, inPantry: true }
    ],
    steps: [
      'Hierve abundante agua y cuece la pasta siguiendo las instrucciones (aprox. 9 minutos).',
      'En los últimos 3 minutos, añade los tomates cherry enteros a la misma agua para que se ablanden sutilmente.',
      'Escurre conservando 2 cucharadas del agua de cocción.',
      'Mezcla la pasta caliente con los tomates, la ricotta fría y un buen chorro de aceite de oliva crudo.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'
  },

  // DISCONNECT / MINDFUL (Desconexión) - Cocina pausada, rituales restauradores, 20-30 minutos
  {
    id: 'rec_7',
    title: 'Risotto de setas y parmesano silvestre',
    description: 'Un ritual de paciencia culinaria donde dar vueltas al arroz silencia los pensamientos del día laboral y calma el pulso.',
    prepTime: 25,
    energyLevel: 'disconnect',
    utensils: ['1 olla'],
    ingredientsNeeded: [
      { name: 'Arroz arborio', required: true, inPantry: true },
      { name: 'Setas variadas de temporada', required: true, inPantry: false },
      { name: 'Parmesano', required: true, inPantry: true },
      { name: 'Caldo de verduras caliente', required: false, inPantry: true }
    ],
    steps: [
      'Saltea las setas picadas en una olla con aceite de oliva hasta que liberen su humedad.',
      'Añade el arroz arborio y nacáralo (tostarlo sin dorar) durante 1 minuto.',
      'Vierte el caldo caliente cazo a cazo, removiendo constantemente a fuego medio. Espera que absorba el caldo antes de añadir el siguiente.',
      'Este proceso repetitivo de remover calmadamente toma unos 18 minutos.',
      'Retira del fuego, añade el parmesano rallado y una nuez de mantequilla o yogur para mantecar.',
      'Tapa y deja reposar 2 minutos antes de degustar este reconfortante plato.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rec_8',
    title: 'Flores de alcachofa confitadas con jamón crujiente',
    description: 'Aprecia el proceso manual de pelar alcachofas frescas, abrirlas en capas delicadas y confitarlas a fuego lento en aceite aromatizado.',
    prepTime: 30,
    energyLevel: 'disconnect',
    utensils: ['1 olla', '1 sarten pequeña'],
    ingredientsNeeded: [
      { name: 'Alcachofas frescas', required: true, inPantry: false },
      { name: 'Jamón ibérico en lonchas', required: false, inPantry: true },
      { name: 'Aceite de oliva virgen extra', required: true, inPantry: true }
    ],
    steps: [
      'Limpia las alcachofas quitando las hojas duras exteriores hasta ver las hojas verde claro.',
      'Corta la punta y cuece en agua hirviendo con limón durante 12 minutos.',
      'Escurre boca abajo y presiona el centro con cuidado para abrir las hojas formando un clavel.',
      'Confita a fuego suave sumergidas en aceite de oliva durante 10 minutos.',
      'Mientras, dora el jamón en lonchas en sartén sin grasa adicional hasta que quede crujiente.',
      'Emplata la flor de alcachofa escurrida y corona con la virutas de jamón crujiente.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=600'
  }
];

export const INGREDIENT_IMAGES: Record<string, string> = {
  // Verduras
  'espinaca': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=120',
  'aguacate': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=120',
  'tomate': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=80&w=120',
  'brócoli': 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?auto=format&fit=crop&q=80&w=120',
  'brocoli': 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?auto=format&fit=crop&q=80&w=120',
  'limón': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=120',
  'limon': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=120',
  'calabacín': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=120',
  'alcachofa': 'https://images.unsplash.com/photo-1548536040-62cdb9950c65?auto=format&fit=crop&q=80&w=120',
  'zanahoria': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=120',
  'champiñon': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=120',
  'champinon': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=120',
  'seta': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=120',
  'hongo': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=120',
  'cebolla': 'https://images.unsplash.com/photo-1508747703725-719e3a5b7b70?auto=format&fit=crop&q=80&w=120',
  'pimiento': 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&q=80&w=120',
  'ajo': 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=120',
  'lechuga': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=120',
  'pepino': 'https://images.unsplash.com/photo-1449300079674-a0ac6698db7e?auto=format&fit=crop&q=80&w=120',
  'patata': 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=120',
  'papa': 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=120',
  'maiz': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=120',
  'maíz': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=120',
  'guisante': 'https://images.unsplash.com/photo-1563379091339-03246a4d82bd?auto=format&fit=crop&q=80&w=120',
  'berenjena': 'https://images.unsplash.com/photo-1629378284990-cc13edb66f0c?auto=format&fit=crop&q=80&w=120',
  // Frutas
  'manzana': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=120',
  'naranja': 'https://images.unsplash.com/photo-1582979512210-d905571fb849?auto=format&fit=crop&q=80&w=120',
  'platano': 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=120',
  'plátano': 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=120',
  'fresa': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=120',
  // Carnes & Proteínas
  'huevo': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=120',
  'pollo': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=120',
  'salmón': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=120',
  'salmon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=120',
  'jamón': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9d0?auto=format&fit=crop&q=80&w=120',
  'jamon': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9d0?auto=format&fit=crop&q=80&w=120',
  'carne': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=120',
  'ternera': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=120',
  'cerdo': 'https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&q=80&w=120',
  'atun': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=120',
  'atún': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=120',
  'camaron': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=120',
  'camarón': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=120',
  // Lácteos
  'yogur': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=120',
  'parmesano': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a2d5?auto=format&fit=crop&q=80&w=120',
  'queso': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=120',
  'feta': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=120',
  'leche': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=120',
  'mantequilla': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=120',
  'crema': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=120',
  // Granos & Legumbres
  'arroz': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=120',
  'pasta': 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=120',
  'pan': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=120',
  'lenteja': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=120',
  'garbanzo': 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&q=80&w=120',
  'frijol': 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&q=80&w=120',
  'fríjol': 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&q=80&w=120',
  'avena': 'https://images.unsplash.com/photo-1614961909612-5c9b0b6ca4af?auto=format&fit=crop&q=80&w=120',
  // Condimentos
  'aceite': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=120',
  'soja': 'https://images.unsplash.com/photo-1582560475093-ba66accbc095?auto=format&fit=crop&q=80&w=120',
  'sal': 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&q=80&w=120',
  'vinagre': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=120',
  'pimienta': 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&q=80&w=120',
};

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Verduras': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=120',
  'Carnes': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=120',
  'Lácteos': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=120',
  'Granos': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=120',
  'Condimentos': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=120',
  'Otros': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=120',
};

export const INITIAL_HISTORY: CookedHistory[] = [
  { id: 'h_1', recipeId: 'rec_1', recipeTitle: 'Ensalada tibia de espinacas y aguacate', date: 'Ayer, a las 21:30', timeSaved: 12, rating: 5 },
  { id: 'h_2', recipeId: 'rec_4', recipeTitle: 'Pechuga de pollo al sésamo con brócoli', date: 'Hace 3 días, a las 20:45', timeSaved: 20, rating: 4 },
  { id: 'h_3', recipeId: 'rec_2', recipeTitle: 'Revuelto rápido de espinacas y huevo', date: 'Hace 5 días, a las 22:00', timeSaved: 8, rating: 5 }
];
