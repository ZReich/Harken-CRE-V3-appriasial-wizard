export enum MapConstants {
  DEFAULT_LATITUDE = 40.9403762,
  DEFAULT_LONGITUDE = -74.1318096,
  DEFAULT_ZOOM = 20,
  DEFAULT_IMAGE_HEIGHT = 360,
  DEFAULT_IMAGE_WIDTH = 1000,
  PIN_IMAGE_HEIGHT = 300,
  PIN_IMAGE_WIDTH = 600,
  PIN_ZOOM = 16,
  PATH_COLOR = 'color:0x0EA2C8ff|weight:6|',
  POLYGON_STROKE_WEIGHT = 2,
}

export enum Routes {
  AERIAL_MAP = '/evaluation-aerialmap',
  PHOTO_SHEET = '/evaluation-photo-sheet',
}

export enum ToastMessages {
  SAVE_SUCCESS = 'Map Boundary saved successfully!',
  SAVE_ERROR = 'Failed to save map boundary',
}