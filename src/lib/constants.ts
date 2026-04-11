// ─────────────────────────────────────────────────────────────────────────────
// constants.ts — Single source of truth for all Rollin' Munchies business data
// TERRY: Never duplicate this data in components. Import from here always.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MenuItem,
  MenuCategory,
  LocationEntry,
  HoursEntry,
  SocialLink,
  SiteConfig,
} from '@/types'

// ─── Site Config ─────────────────────────────────────────────────────────────

export const SITE_CONFIG: SiteConfig = {
  name:        "Rollin' Munchies",
  tagline:     'No Seats. Just Good Eats.',
  description: 'Tarboro\'s favorite food truck serving up bold burgers, loaded dogs, and rollin\' fries. Find us on Western Blvd and at local events.',
  phone:       '(252) 907-9660',
  email:       'Rollinmunchiesfamily@gmail.com',
  address: {
    street: '1528 N Main St',
    city:   'Tarboro',
    state:  'NC',
    zip:    '27886',
  },
}

// ─── Hours ────────────────────────────────────────────────────────────────────

export const HOURS: HoursEntry[] = [
  { day: 'Monday',    open: null,     close: null,    closed: true  },
  { day: 'Tuesday',   open: '11:30',  close: '18:00', closed: false },
  { day: 'Wednesday', open: '11:30',  close: '18:00', closed: false },
  { day: 'Thursday',  open: '11:30',  close: '18:00', closed: false },
  { day: 'Friday',    open: '11:30',  close: '18:00', closed: false },
  { day: 'Saturday',  open: '12:00',  close: '18:00', closed: false },
  { day: 'Sunday',    open: null,     close: null,    closed: true  },
]

// ─── Locations ────────────────────────────────────────────────────────────────

export const LOCATIONS: LocationEntry[] = [
  {
    id:          'main',
    label:       'Main Spot',
    address:     '1528 N Main St, Tarboro, NC 27886',
    description: 'Our primary location. Pull up Tue–Sat.',
    coordinates: { lat: 35.9032, lng: -77.5327 },
    isPrimary:   true,
  },
  {
    id:          'reillys',
    label:       "Reilly's",
    address:     '1302 Western Blvd, Tarboro, NC 27886',
    description: 'Catch us parked outside Reilly\'s.',
    coordinates: { lat: 35.8978, lng: -77.5445 },
    isPrimary:   false,
  },
  {
    id:          'dunkin',
    label:       'Behind Tarboro Dunkin\'',
    address:     'Western Blvd, Tarboro, NC',
    description: 'Follow the smoke — we\'re behind Dunkin\'. Until sold out.',
    coordinates: { lat: 35.8975, lng: -77.5441 },
    isPrimary:   false,
  },
]

// ─── Events ───────────────────────────────────────────────────────────────────

export const RECURRING_EVENTS = [
  {
    id:          'wild-wednesdays',
    name:        'Wild Wednesdays Car Show',
    venue:       'Liftking, Tarboro NC',
    description: 'Every Wednesday. Real cars, real food. Come hungry.',
    dayOfWeek:   3, // Wednesday
    recurring:   true,
  },
]

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const MENU_ITEMS: MenuItem[] = [
  // — Burgers —
  {
    id:          'jamaican-jack',
    name:        'Jamaican Jack Burger',
    category:    'burgers',
    description: 'Bold Jamaican-spiced patty with all the fixins. A fan favorite — ask for the Brandon Fries on the side.',
    isSignature: true,
    isPopular:   true,
    heatLevel:   2,
    tags:        ['bestseller', 'bold'],
  },
  {
    id:          'classic-smash',
    name:        'Classic Smash Burger',
    category:    'burgers',
    description: 'Double smash patty, American cheese, pickles, special sauce. Fundamentals, executed perfectly.',
    isSignature: false,
    isPopular:   true,
    heatLevel:   0,
    tags:        ['classic'],
  },
  {
    id:          'munchie-melt',
    name:        'Munchie Melt',
    category:    'burgers',
    description: 'Smash patty, grilled onions, two cheeses, on Texas toast. Heavy and proud of it.',
    isSignature: true,
    isPopular:   false,
    heatLevel:   0,
    tags:        ['hearty'],
  },

  // — Dogs —
  {
    id:          'hot-honey-dawg',
    name:        'Hot Honey Dawg',
    category:    'dogs',
    description: 'All-beef dog drizzled with hot honey, crispy jalapeños, and slaw. Sweet, heat, crunch — in that order.',
    isSignature: true,
    isPopular:   true,
    heatLevel:   3,
    tags:        ['bestseller', 'hot-honey', 'spicy'],
  },
  {
    id:          'classic-dog',
    name:        'Classic Rollin\' Dog',
    category:    'dogs',
    description: 'Grilled all-beef dog, yellow mustard, relish, onion. Respect the classics.',
    isSignature: false,
    isPopular:   false,
    heatLevel:   0,
    tags:        ['classic'],
  },

  // — Fries & Sides —
  {
    id:          'rollin-fries',
    name:        "Rollin' Fries",
    category:    'sides',
    description: 'Seasoned crispy fries. Add hot honey for a game-changing upgrade. You\'ve been warned.',
    isSignature: true,
    isPopular:   true,
    heatLevel:   0,
    addons:      ['+ Hot Honey', '+ Cheese Sauce', '+ Seasoning Upgrade'],
    tags:        ['must-try'],
  },
  {
    id:          'brandon-fries',
    name:        'Brandon Fries',
    category:    'sides',
    description: 'Loaded fries the way they were meant to be. Named. Claimed. Delicious.',
    isSignature: true,
    isPopular:   true,
    heatLevel:   1,
    tags:        ['loaded', 'must-try'],
  },
]

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'burgers', label: 'Burgers',       emoji: '🍔', description: 'Smashed, stacked, and unapologetic' },
  { id: 'dogs',    label: 'Dogs',           emoji: '🌭', description: 'All-beef. All flavor.' },
  { id: 'sides',   label: 'Fries & Sides',  emoji: '🍟', description: 'The supporting cast that steals the show' },
]

// ─── Social Links ─────────────────────────────────────────────────────────────

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Facebook',
    handle:   'ROLLINMUNCHIESLLC',
    url:      'https://www.facebook.com/ROLLINMUNCHIESLLC',
    icon:     'facebook',
  },
  {
    platform: 'Instagram',
    handle:   'rollin_munchies',
    url:      'https://www.instagram.com/rollin_munchies',
    icon:     'instagram',
  },
]

// ─── Nav Links ────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Menu',    href: '#menu'    },
  { label: 'Find Us', href: '#find-us' },
  { label: 'Contact', href: '#contact' },
] as const