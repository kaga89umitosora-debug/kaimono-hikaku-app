import type { Translations } from '../types';

/**
 * 英語辞書。ja.ts と同一のキーを必ず持つ (Translations = Record<MessageKey, string> で強制)。
 * キーの過不足はコンパイルエラーになる。
 */
export const en: Translations = {
  // Bottom navigation
  'nav.stores': 'Stores',
  'nav.products': 'Compare',
  'nav.shoppingList': 'Shopping list',

  // Common actions
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.confirmDelete': 'Delete',
  'common.addAction': 'Add',
  'common.changeAction': 'Change',
  'common.close': 'Close',
  'common.unitPrice': 'Unit price',
  'common.next': 'Next',
  'common.back': 'Back',
  'common.skip': 'Skip',
  'common.start': 'Get Started',

  // Screen headings
  'screen.stores.title': 'Stores',
  'screen.stores.addStore': '+ Add Store',
  'screen.products.title': 'Product Comparison',
  'screen.products.addProduct': '+ Add Product',
  'screen.shoppingList.title': 'Shopping List',
  'screen.shoppingList.addItem': '+ Add Item',

  // Store management (B1)
  'store.emptyList': 'No stores added yet.',
  'store.moveUp': 'Move up',
  'store.moveDown': 'Move down',
  'store.addTitle': 'Add Store',
  'store.editTitle': 'Edit Store Name',
  'store.deleteAria': 'Delete store',
  'store.deleteConfirmTitle': 'Delete this store?',
  'store.deleteConfirmMessage': 'All price data for this store will also be deleted.',
  'store.nameLabel': 'Store Name',
  'store.namePlaceholder': 'e.g. Store A',

  // Display settings (language selection)
  'settings.display': 'Display Settings',
  'settings.language': 'Language',

  // About this app (B1)
  'about.title': 'About This App',
  'about.privacyPolicy': 'Privacy Policy',

  // Backup & restore (B1)
  'backup.title': 'Backup & Restore',
  'backup.hint': 'Export or import your stores, products and prices as a JSON file.',
  'backup.export': 'Export JSON',
  'backup.import': 'Import JSON',
  'backup.restoreConfirmTitle': 'Restore data?',
  'backup.restoreConfirmMessage': 'Your current data will be overwritten. Restore from "{name}"?',
  'backup.restoreConfirmAction': 'Restore',
  'backup.restoreFailed': 'Restore failed.',

  // Product comparison (B2)
  'product.addTitle': 'Add Product',
  'product.editTitle': 'Edit Product',
  'product.tapHint': 'Tap a store price on a product to add it to your shopping list.',
  'product.noMatch': 'No matching products.',
  'product.backToTop': 'Back to top',
  'product.searchPlaceholder': 'Search by product name',
  'product.savedBadge': '✅ Saved',
  'product.addedBadge': '✅ Added',
  'product.updatedOn': '· Updated',
  'product.moveHint': 'To change where you buy this from {store}, tap another store.',
  'product.editAria': 'Edit {name}',
  'product.deleteAria': 'Delete {name}',
  'product.registerStoreFirst': 'Add a store first.',
  'product.priceUnset': 'Price not set',
  'product.deleteConfirmTitle': 'Delete this product?',
  'product.addToListConfirmTitle': 'Add to shopping list?',
  'product.addToListConfirmMessage': 'Add "{name}" to {store}\'s shopping list?',
  'product.alreadyInList': 'Already in your shopping list.',
  'product.changeStoreConfirmTitle': 'Change the store?',
  'product.changeStoreConfirmMessage': 'Change where you buy "{name}"\nfrom {from} to {to}?',
  'product.alreadyInListNamed': 'This product is already in {store}\'s shopping list.',
  'product.movedNotice': 'Moved "{name}" to {store}\'s shopping list.',
  'product.addedToListNotice': 'Added "{name}" to {store}\'s shopping list.',
  'product.nameLabel': 'Product Name',
  'product.namePlaceholder': 'e.g. Strawberries',
  'product.pricesLabel': 'Price at each store',
  'product.priceInputPlaceholder': 'Not set',
  'product.priceError': 'Enter a price of 0 or more.',
  'product.quantityLabel': 'Quantity',
  'product.quantityPlaceholder': 'Leave blank to compare by price only',
  'product.unitLabel': 'Unit',
  'product.customUnitLabel': 'Unit (custom)',
  'product.customUnitPlaceholder': 'e.g. bottle, sheet, box',
  'product.commentLabel': 'Comment (optional)',
  'product.commentPlaceholder': 'e.g. Discounted in the evening\nFrozen food aisle\nOften sold out',
  'product.purchaseStoreLabel': 'Store',

  // Shopping list (B3)
  'shoppingList.total': 'Total',
  'shoppingList.filterAll': 'All',
  'shoppingList.resetAll': 'Reset All',
  'shoppingList.reset': 'Reset',
  'shoppingList.deleteAllAction': 'Delete All',
  'shoppingList.emptyAll':
    'Your shopping list is empty. Tap "+ Add Item", or tap a store price on the Compare screen to add items.',
  'shoppingList.emptyStore': 'No items for this store.',
  'shoppingList.unnamed': '(Unnamed)',
  'shoppingList.buyElsewhere': 'Buy Elsewhere',
  'shoppingList.resetAllConfirmTitle': 'Reset the entire shopping list?',
  'shoppingList.resetAllConfirmMessage': "Delete every store's shopping list?",
  'shoppingList.deleteItemConfirmTitle': 'Remove from shopping list?',
  'shoppingList.deleteItemConfirmMessage': 'Remove "{name}" from your shopping list?',
  'shoppingList.resetStoreConfirmTitle': 'Reset this shopping list?',
  'shoppingList.resetStoreConfirmMessage': "Delete {store}'s entire shopping list?",
  'shoppingList.addModalTitle': 'Add to Shopping List',
  'shoppingList.searchPlaceholder': 'e.g. Milk',
  'shoppingList.suggestHint': 'Is this what you meant?',
  'shoppingList.noPriceYet': 'No price yet',
  'shoppingList.noneOfThese': 'None of these',
  'shoppingList.noStoreWithPrice': 'No stores have a price for this product.',
  'shoppingList.notFoundPrompt': 'How would you like to add this item?',
  'shoppingList.addToComparison': 'Add to Product Comparison',
  'shoppingList.addTodayOnly': 'Add to this shopping list only',
  'shoppingList.pickStoreTitle': 'Choose a store',
  'shoppingList.addTodayConfirmTitle': 'Add for this trip only?',
  'shoppingList.addTodayConfirmMessage': 'Add "{name}" for this trip only,\nto {store}\'s shopping list?',
  'shoppingList.addedToStoreNotice': "Added to {store}'s shopping list.",

  // Unit display labels. Stored values (UNIT_OPTIONS / Product.unit in types/index.ts) stay unchanged; only the label is translated.
  'unit.piece': 'piece',
  'unit.g': 'g',
  'unit.kg': 'kg',
  'unit.ml': 'ml',
  'unit.l': 'L',
  'unit.bag': 'bag',
  'unit.other': 'Other',

  // Onboarding (B4). Step order lives in ONBOARDING_STEP_IDS (src/onboarding/steps.ts).
  'onboarding.stores.title': 'Add Your Stores',
  'onboarding.stores.body':
    'Add the stores you shop at regularly.\nYou can compare product prices across your stores.',
  'onboarding.compare.title': 'Compare Prices',
  'onboarding.compare.body':
    'Add a product and enter its price at each store.\nThe lowest price is easy to spot.',
  'onboarding.list.title': 'Create a Shopping List',
  'onboarding.list.body':
    'Tap a store price on the Product Comparison screen\nto add the product to your shopping list.',
  'onboarding.replay': 'View Guide Again',

  // Dialogs (placeholder interpolation; used by the product delete confirm in ProductCard)
  'dialog.deleteProduct': 'All price data for "{name}" will also be deleted.',
};
