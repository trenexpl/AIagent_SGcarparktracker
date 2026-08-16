import { 
  SavedCarparkItem, 
  RecentSearchItem, 
  AlertSetting, 
  Carpark, 
  CommunityComment, 
  UserAccount, 
  SubscriptionPlan,
  SubscriptionPlanDetails,
  PaymentDetails
} from '../types/carpark';

const SAVED_CARPARKS_KEY = 'parksg_saved_carparks_v1';
const RECENT_SEARCHES_KEY = 'parksg_recent_searches_v1';
const ALERTS_KEY = 'parksg_alerts_v1';
const COMMUNITY_COMMENTS_KEY = 'parksg_community_comments_v1';
const CURRENT_USER_KEY = 'parksg_current_user_v2';
const USERS_LIST_KEY = 'parksg_registered_users_v2';

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  free: {
    id: 'free',
    name: 'Free Driver',
    price: 0,
    priceDisplay: 'Free',
    billingPeriod: 'monthly',
    maxFavorites: 0,
    features: [
      'Live SG carpark telemetry & availability',
      'Real-time rate & distance calculator',
      'Interactive map & radius exploration',
      'Navigation & GPS directions: 🔒 Paid Plan Required',
      'Favorites: 🔒 Paid Plan Required'
    ],
  },
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 2.99,
    priceDisplay: '$2.99/mo',
    billingPeriod: 'monthly',
    maxFavorites: 5,
    features: [
      'Full GPS turn-by-turn navigation (Google, Apple, Waze, Citymapper)',
      'Save up to 5 favorite locations',
      'Instant 1-tap navigation to saved spots',
      'Live lot availability monitoring',
      'Synced across your driver account',
      'Cancel anytime with no lock-in'
    ],
    popular: false,
    badge: 'Starter'
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 5.99,
    priceDisplay: '$5.99/mo',
    billingPeriod: 'monthly',
    maxFavorites: Infinity,
    features: [
      'Unlimited GPS turn-by-turn navigation across all mapping apps',
      'Unlimited favorite locations',
      'Priority live lot alerts & notifications',
      'Direct navigation & route shortcuts',
      'Cloud backup & sync across devices',
      'Cancel anytime with 1 click'
    ],
    popular: true,
    badge: 'Best Value'
  }
};

// Seed demo user accounts for immediate testing
const INITIAL_DEMO_USERS: UserAccount[] = [
  {
    id: 'user-admin-master',
    name: 'Admin (trenexpl)',
    email: 'trenexpl@gmail.com',
    password: 'Test123',
    plan: 'pro',
    isAdmin: true,
    role: 'admin',
    subscriptionStartDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    subscriptionRenewsAt: new Date(Date.now() + 86400000 * 365).toISOString(),
    lastPaymentMethod: 'Admin Master Key (Full Access)',
    savedCarparks: [
      {
        id: 'saved-admin-1',
        carparkId: 'orchard-ion',
        carparkName: 'ION Orchard Carpark',
        address: '2 Orchard Turn, Singapore 238801',
        savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        frequencyCount: 12,
        notes: 'Admin monitor: Orchard Road core commercial hub',
      },
      {
        id: 'saved-admin-2',
        carparkId: 'mbs-shopper',
        carparkName: 'Marina Bay Sands (South Carpark)',
        address: '10 Bayfront Avenue, Singapore 018956',
        savedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        frequencyCount: 8,
        notes: 'Admin monitor: Marina Bay & Bayfront convention node',
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'user-demo-1',
    name: 'Sarah Tan',
    email: 'sarah.tan@driver.sg',
    password: 'password123',
    plan: 'free',
    isAdmin: false,
    role: 'driver',
    savedCarparks: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'user-demo-2',
    name: 'Kenji Tan (Pro Driver)',
    email: 'kenji.pro@driver.sg',
    password: 'password123',
    plan: 'pro',
    isAdmin: false,
    role: 'driver',
    subscriptionStartDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    subscriptionRenewsAt: new Date(Date.now() + 86400000 * 18).toISOString(),
    lastPaymentMethod: 'Visa •••• 4242',
    savedCarparks: [
      {
        id: 'saved-init-1',
        carparkId: 'orchard-ion',
        carparkName: 'ION Orchard Carpark',
        address: '2 Orchard Turn, Singapore 238801',
        savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        frequencyCount: 8,
        notes: 'Best parking for Orchard shopping & MRT',
      },
      {
        id: 'saved-init-2',
        carparkId: 'suntec-city',
        carparkName: 'Suntec City (Mall & Convention)',
        address: '3 Temasek Boulevard, Singapore 038983',
        savedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        frequencyCount: 4,
        notes: 'Fast EV charger on B3 Yellow Zone',
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  }
];

// Default pre-seeded community comments
const DEFAULT_COMMUNITY_COMMENTS: CommunityComment[] = [
  {
    id: 'comm-1',
    authorName: 'Kenji T.',
    authorHandle: 'kenji_driver',
    carparkName: 'Bras Basah Complex MSCP',
    category: 'parking_tip',
    content: 'Free parking on Sundays and Public Holidays after 5:00 PM! Great spot if you are dining near Bugis or National Library.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    likes: 18,
    likedByMe: false,
  },
  {
    id: 'comm-2',
    authorName: 'Marcus L.',
    authorHandle: 'marcus_sg',
    carparkName: 'Suntec City Mall',
    category: 'ev_charging',
    content: 'Level B3 (Yellow Zone near Tower 4) has 6 fast EV charging lots. Usually vacant even during peak Saturday afternoon shopping!',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: 12,
    likedByMe: true,
  },
  {
    id: 'comm-3',
    authorName: 'Sarah Lim',
    authorHandle: 'sarah_civic',
    carparkName: 'Orchard Central',
    category: 'gantry_rates',
    content: 'Friendly reminder: Orchard Central spiral entry ramp is quite narrow for wider MPVs/SUVs. Take it slow when turning in from Somerset Road.',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    likes: 24,
    likedByMe: false,
  },
  {
    id: 'comm-4',
    authorName: 'Dave Kumar',
    authorHandle: 'dave_k',
    carparkName: 'Jewel Changi Airport',
    category: 'parking_tip',
    content: 'Level B2 fills up completely by 6:30pm on weekends. Drive straight down to Level B3 or B4 for abundant spacious lots right next to the lift lobbies.',
    timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
    likes: 15,
    likedByMe: false,
  },
];

// Default empty saved carparks for new users
const DEFAULT_SAVED_CARPARKS: SavedCarparkItem[] = [];

const DEFAULT_RECENT_SEARCHES: RecentSearchItem[] = [
  {
    id: 'rec-1',
    query: 'ION Orchard',
    destinationName: 'ION Orchard',
    address: '2 Orchard Turn, Singapore 238801',
    latitude: 1.3040,
    longitude: 103.8318,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'rec-2',
    query: 'Marina Bay Sands',
    destinationName: 'Marina Bay Sands & Shoppes',
    address: '10 Bayfront Avenue, Singapore 018956',
    latitude: 1.2834,
    longitude: 103.8607,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'rec-3',
    query: 'Bugis Junction',
    destinationName: 'Bugis Junction & Bugis+',
    address: '200 Victoria Street, Singapore 188021',
    latitude: 1.3000,
    longitude: 103.8553,
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
  },
];

export const storageService = {
  // --- USER AUTHENTICATION & SESSIONS ---
  getAllUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(USERS_LIST_KEY);
      let users: UserAccount[] = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;

      // Ensure Master Admin account is always present with credentials: trenexpl@gmail.com / Test123
      const adminIndex = users.findIndex((u) => u.email.toLowerCase() === 'trenexpl@gmail.com');
      if (adminIndex === -1) {
        users.unshift(INITIAL_DEMO_USERS[0]);
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
      } else {
        // Guarantee admin role & Pro privileges
        users[adminIndex].isAdmin = true;
        users[adminIndex].role = 'admin';
        users[adminIndex].plan = 'pro';
        users[adminIndex].password = 'Test123';
      }

      return users;
    } catch {
      return INITIAL_DEMO_USERS;
    }
  },

  getCurrentUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Refresh user with latest in database
      const allUsers = this.getAllUsers();
      const match = allUsers.find((u) => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
      return match || parsed;
    } catch {
      return null;
    }
  },

  signUp(name: string, email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedName) {
      return { success: false, error: 'Name and email are required.' };
    }

    if (trimmedEmail === 'trenexpl@gmail.com') {
      return { success: false, error: 'This is the master administrator email. Please log in directly with your password.' };
    }

    const allUsers = this.getAllUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: password || 'password123',
      plan: 'free',
      isAdmin: false,
      role: 'driver',
      savedCarparks: [],
      createdAt: new Date().toISOString(),
    };

    allUsers.push(newUser);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  logIn(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const allUsers = this.getAllUsers();

    // 1. Strict Master Admin credentials verification
    if (trimmedEmail === 'trenexpl@gmail.com') {
      if (password !== 'Test123') {
        return {
          success: false,
          error: 'Invalid admin credentials. Please enter the correct password for trenexpl@gmail.com.',
        };
      }

      let adminUser = allUsers.find((u) => u.email.toLowerCase() === 'trenexpl@gmail.com');
      if (!adminUser) {
        adminUser = INITIAL_DEMO_USERS[0];
        allUsers.unshift(adminUser);
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));
      } else {
        adminUser.isAdmin = true;
        adminUser.role = 'admin';
        adminUser.plan = 'pro';
        adminUser.password = 'Test123';
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // 2. Standard user login
    let match = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!match) {
      // If user doesn't exist, create a new free driver account smoothly
      const created = this.signUp(email.split('@')[0] || 'Driver', trimmedEmail, password);
      return created;
    }

    if (match.password && password && match.password !== password) {
      return { success: false, error: 'Incorrect password for this account.' };
    }

    // Update active session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
    return { success: true, user: match };
  },

  logOut(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  updateUserPlan(plan: SubscriptionPlan, paymentDetails?: Partial<PaymentDetails>): { success: boolean; user: UserAccount } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to update subscription plan.');
    }

    const allUsers = this.getAllUsers();
    const userIndex = allUsers.findIndex((u) => u.id === currentUser.id);

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let paymentMethodDisplay = currentUser.lastPaymentMethod;
    if (paymentDetails?.paymentMethod === 'credit_card' && paymentDetails.cardNumber) {
      paymentMethodDisplay = `Card •••• ${paymentDetails.cardNumber.slice(-4)}`;
    } else if (paymentDetails?.paymentMethod === 'paynow') {
      paymentMethodDisplay = 'PayNow SG';
    } else if (paymentDetails?.paymentMethod === 'apple_pay') {
      paymentMethodDisplay = 'Apple Pay';
    } else if (paymentDetails?.paymentMethod === 'google_pay') {
      paymentMethodDisplay = 'Google Pay';
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      plan,
      subscriptionStartDate: plan !== 'free' ? now.toISOString() : undefined,
      subscriptionRenewsAt: plan !== 'free' ? nextMonth.toISOString() : undefined,
      lastPaymentMethod: plan !== 'free' ? paymentMethodDisplay : undefined,
    };

    if (userIndex >= 0) {
      allUsers[userIndex] = updatedUser;
    } else {
      allUsers.push(updatedUser);
    }

    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return { success: true, user: updatedUser };
  },

  // --- SAVED / FAVORITED CARPARKS (ACCOUNT-SCOPED) ---
  getSavedCarparks(): SavedCarparkItem[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return currentUser.savedCarparks || [];
  },

  isCarparkSaved(carparkId: string): boolean {
    const saved = this.getSavedCarparks();
    return saved.some((s) => s.carparkId === carparkId);
  },

  toggleSaveCarpark(
    carpark: Carpark, 
    notes?: string
  ): { 
    success: boolean; 
    action: 'added' | 'removed' | 'auth_required' | 'plan_upgrade_required' | 'plan_limit_reached'; 
    message: string; 
    savedList: SavedCarparkItem[];
    currentPlan: SubscriptionPlan;
    limit: number;
  } {
    const currentUser = this.getCurrentUser();
    
    // 1. Requirement: Must be signed in
    if (!currentUser) {
      return {
        success: false,
        action: 'auth_required',
        message: 'Please sign in or create an account to save favorite carparks.',
        savedList: [],
        currentPlan: 'free',
        limit: 0,
      };
    }

    const currentSaved = currentUser.savedCarparks || [];
    const existingIndex = currentSaved.findIndex((s) => s.carparkId === carpark.id);

    // If already saved -> Unstar / Remove is always allowed
    if (existingIndex >= 0) {
      const filtered = currentSaved.filter((s) => s.carparkId !== carpark.id);
      this._updateUserSavedList(currentUser.id, filtered);
      return {
        success: true,
        action: 'removed',
        message: `Removed ${carpark.name} from your favorites.`,
        savedList: filtered,
        currentPlan: currentUser.plan,
        limit: SUBSCRIPTION_PLANS[currentUser.plan].maxFavorites,
      };
    }

    // 2. Requirement: Free plan user cannot save favorites (or must upgrade)
    if (!currentUser.isAdmin && currentUser.role !== 'admin' && currentUser.plan === 'free') {
      return {
        success: false,
        action: 'plan_upgrade_required',
        message: 'Under the Free plan, favorites are locked. Upgrade to Basic ($2.99/mo) or Pro ($5.99/mo) to save favorite locations.',
        savedList: currentSaved,
        currentPlan: 'free',
        limit: 0,
      };
    }

    // 3. Requirement: Basic plan limit of 5 locations
    const planDetails = SUBSCRIPTION_PLANS[currentUser.plan];
    if (!currentUser.isAdmin && currentUser.role !== 'admin' && currentUser.plan === 'basic' && currentSaved.length >= 5) {
      return {
        success: false,
        action: 'plan_limit_reached',
        message: 'Basic Plan limit reached (5/5 favorites used). Upgrade to Pro Plan for $5.99/mo to save unlimited locations!',
        savedList: currentSaved,
        currentPlan: 'basic',
        limit: 5,
      };
    }

    // 4. Add new favorite carpark
    const newItem: SavedCarparkItem = {
      id: `saved-${Date.now()}`,
      carparkId: carpark.id,
      carparkName: carpark.name,
      address: carpark.address,
      savedAt: new Date().toISOString(),
      frequencyCount: 1,
      notes: notes || `Saved for quick access in ${carpark.area}`,
    };

    const updated = [newItem, ...currentSaved];
    this._updateUserSavedList(currentUser.id, updated);

    return {
      success: true,
      action: 'added',
      message: `Saved ${carpark.name} to your favorites!`,
      savedList: updated,
      currentPlan: currentUser.plan,
      limit: planDetails.maxFavorites,
    };
  },

  removeSavedCarpark(carparkId: string): SavedCarparkItem[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const currentSaved = currentUser.savedCarparks || [];
    const filtered = currentSaved.filter((s) => s.carparkId !== carparkId);
    this._updateUserSavedList(currentUser.id, filtered);
    return filtered;
  },

  updateSavedCarparkNotes(carparkId: string, notes: string): SavedCarparkItem[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const currentSaved = currentUser.savedCarparks || [];
    const updated = currentSaved.map((s) => (s.carparkId === carparkId ? { ...s, notes } : s));
    this._updateUserSavedList(currentUser.id, updated);
    return updated;
  },

  getSavedCarparkItem(carparkId: string): SavedCarparkItem | undefined {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return undefined;
    return (currentUser.savedCarparks || []).find((s) => s.carparkId === carparkId);
  },

  _updateUserSavedList(userId: string, savedList: SavedCarparkItem[]) {
    const allUsers = this.getAllUsers();
    const userIndex = allUsers.findIndex((u) => u.id === userId);
    if (userIndex >= 0) {
      allUsers[userIndex].savedCarparks = savedList;
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));
    }
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.savedCarparks = savedList;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  },

  recordNavigationUsage(carparkId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    const saved = currentUser.savedCarparks || [];
    const item = saved.find((s) => s.carparkId === carparkId);
    if (item) {
      item.frequencyCount = (item.frequencyCount || 0) + 1;
      this._updateUserSavedList(currentUser.id, saved);
    }
  },

  // Recent Searches
  getRecentSearches(): RecentSearchItem[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(DEFAULT_RECENT_SEARCHES));
        return DEFAULT_RECENT_SEARCHES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RECENT_SEARCHES;
    }
  },

  addRecentSearch(query: string, destName: string, address: string, lat: number, lng: number) {
    const searches = this.getRecentSearches().filter((s) => s.destinationName.toLowerCase() !== destName.toLowerCase());
    const newItem: RecentSearchItem = {
      id: `search-${Date.now()}`,
      query,
      destinationName: destName,
      address,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
    };
    searches.unshift(newItem);
    // Keep max 8 recent searches
    const trimmed = searches.slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  },

  clearRecentSearches() {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([]));
  },

  // Alerts
  getAlerts(): AlertSetting[] {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveAlert(alert: Omit<AlertSetting, 'id' | 'createdAt'>): AlertSetting {
    const alerts = this.getAlerts();
    const existingIndex = alerts.findIndex((a) => a.carparkId === alert.carparkId);
    
    const newAlert: AlertSetting = {
      ...alert,
      id: existingIndex >= 0 ? alerts[existingIndex].id : `alert-${Date.now()}`,
      createdAt: existingIndex >= 0 ? alerts[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      alerts[existingIndex] = newAlert;
    } else {
      alerts.push(newAlert);
    }

    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    return newAlert;
  },

  removeAlert(carparkId: string) {
    const alerts = this.getAlerts().filter((a) => a.carparkId !== carparkId);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  },

  getAlertForCarpark(carparkId: string): AlertSetting | undefined {
    return this.getAlerts().find((a) => a.carparkId === carparkId);
  },

  // Community Comments
  getCommunityComments(): CommunityComment[] {
    try {
      const stored = localStorage.getItem(COMMUNITY_COMMENTS_KEY);
      if (!stored) {
        localStorage.setItem(COMMUNITY_COMMENTS_KEY, JSON.stringify(DEFAULT_COMMUNITY_COMMENTS));
        return DEFAULT_COMMUNITY_COMMENTS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_COMMUNITY_COMMENTS;
    }
  },

  addCommunityComment(comment: Omit<CommunityComment, 'id' | 'timestamp' | 'likes' | 'likedByMe'>): CommunityComment {
    const comments = this.getCommunityComments();
    const newComment: CommunityComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
    comments.unshift(newComment);
    localStorage.setItem(COMMUNITY_COMMENTS_KEY, JSON.stringify(comments));
    return newComment;
  },

  toggleLikeComment(commentId: string): CommunityComment[] {
    const comments = this.getCommunityComments();
    const target = comments.find((c) => c.id === commentId);
    if (target) {
      if (target.likedByMe) {
        target.likes = Math.max(0, target.likes - 1);
        target.likedByMe = false;
      } else {
        target.likes = target.likes + 1;
        target.likedByMe = true;
      }
      localStorage.setItem(COMMUNITY_COMMENTS_KEY, JSON.stringify(comments));
    }
    return comments;
  },

  deleteCommunityComment(commentId: string): CommunityComment[] {
    const comments = this.getCommunityComments().filter((c) => c.id !== commentId);
    localStorage.setItem(COMMUNITY_COMMENTS_KEY, JSON.stringify(comments));
    return comments;
  },

  /**
   * Check whether the user has active permission to use Turn-by-Turn GPS Navigation.
   * Navigation requires the user to be logged in AND on an active paid plan (Basic $2.99 or Pro $5.99) or Master Admin account.
   */
  hasNavigationAccess(user?: UserAccount | null): boolean {
    const targetUser = user !== undefined ? user : this.getCurrentUser();
    if (!targetUser) return false;
    if (targetUser.isAdmin || targetUser.role === 'admin') return true;
    return targetUser.plan === 'basic' || targetUser.plan === 'pro';
  },
};

