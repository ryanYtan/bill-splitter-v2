// Ceilings of the share-link format (enforced by share/format.ts when a link is opened). Anything the
// app lets a user enter must stay within these, otherwise the sender's own link would be rejected.
export const MAX_USERS = 200
export const MAX_ITEMS = 500
export const MAX_TEXT_LENGTH = 200
export const MAX_PRICE = 1e9
export const MAX_QUANTITY = 1e6

// Tighter limits for what can be entered in the app (by hand or from a scanned receipt)
export const MAX_USER_NAME_LENGTH = 20
export const MAX_ENTRY_QUANTITY = 30
