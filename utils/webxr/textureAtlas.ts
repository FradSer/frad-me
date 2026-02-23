import * as THREE from 'three';

export interface AtlasConfig {
  width: number;
  height: number;
  columns: number;
  rows: number;
  padding?: number;
  backgroundColor?: string;
}

export interface AtlasTileInfo {
  index: number;
  uvOffset: [number, number];
  uvScale: [number, number];
  column: number;
  row: number;
}

export interface AtlasResult {
  texture: THREE.Texture;
  tiles: AtlasTileInfo[];
  tileSize: [number, number];
  tileCount: number;
}

export const DEFAULT_ATLAS_CONFIG: AtlasConfig = {
  width: 2048,
  height: 2048,
  columns: 2,
  rows: 3,
  padding: 4,
  backgroundColor: '#1a1a1a',
} as const;

export const MAX_ATLAS_SIZE = 4096;
export const MIN_ATLAS_SIZE = 256;

export const isPowerOfTwo = (value: number): boolean => {
  return value > 0 && (value & (value - 1)) === 0;
};

export const validateAtlasConfig = (config: AtlasConfig): boolean => {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (config.width < MIN_ATLAS_SIZE || config.width > MAX_ATLAS_SIZE) {
    return false;
  }

  if (config.height < MIN_ATLAS_SIZE || config.height > MAX_ATLAS_SIZE) {
    return false;
  }

  if (!isPowerOfTwo(config.width) || !isPowerOfTwo(config.height)) {
    return false;
  }

  if (config.columns < 1 || config.rows < 1) {
    return false;
  }

  if (config.padding !== undefined && config.padding < 0) {
    return false;
  }

  return true;
};

export const calculateTileUV = (
  column: number,
  row: number,
  config: AtlasConfig,
): { uvOffset: [number, number]; uvScale: [number, number] } => {
  const padding = config.padding ?? 0;
  const tileWidth = (config.width - padding * (config.columns + 1)) / config.columns;
  const tileHeight = (config.height - padding * (config.rows + 1)) / config.rows;

  const uvX = (padding + column * (tileWidth + padding)) / config.width;
  const uvY = 1 - (padding + row * (tileHeight + padding) + tileHeight) / config.height;

  return {
    uvOffset: [uvX, uvY],
    uvScale: [tileWidth / config.width, tileHeight / config.height],
  };
};

export const getTileInfo = (index: number, config: AtlasConfig): AtlasTileInfo | null => {
  if (index < 0 || index >= config.columns * config.rows) {
    return null;
  }

  const column = index % config.columns;
  const row = Math.floor(index / config.columns);
  const { uvOffset, uvScale } = calculateTileUV(column, row, config);

  return {
    index,
    uvOffset,
    uvScale,
    column,
    row,
  };
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    image.src = url;
  });
};

export const createTextureAtlas = async (
  imageUrls: string[],
  config: Partial<AtlasConfig> = {},
): Promise<AtlasResult> => {
  const finalConfig: AtlasConfig = {
    ...DEFAULT_ATLAS_CONFIG,
    ...config,
  };

  if (!validateAtlasConfig(finalConfig)) {
    throw new Error('Invalid atlas configuration');
  }

  if (imageUrls.length === 0) {
    throw new Error('No images provided for atlas creation');
  }

  if (imageUrls.length > finalConfig.columns * finalConfig.rows) {
    throw new Error(
      `Too many images (${imageUrls.length}) for atlas grid (${finalConfig.columns}x${finalConfig.rows})`,
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = finalConfig.width;
  canvas.height = finalConfig.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const padding = finalConfig.padding ?? 0;
  const tileWidth = (finalConfig.width - padding * (finalConfig.columns + 1)) / finalConfig.columns;
  const tileHeight = (finalConfig.height - padding * (finalConfig.rows + 1)) / finalConfig.rows;

  if (finalConfig.backgroundColor) {
    ctx.fillStyle = finalConfig.backgroundColor;
    ctx.fillRect(0, 0, finalConfig.width, finalConfig.height);
  }

  const tiles: AtlasTileInfo[] = [];

  await Promise.all(
    imageUrls.map(async (url, index) => {
      try {
        const image = await loadImage(url);

        const column = index % finalConfig.columns;
        const row = Math.floor(index / finalConfig.columns);

        const x = padding + column * (tileWidth + padding);
        const y = padding + row * (tileHeight + padding);

        const imageAspect = image.width / image.height;
        const tileAspect = tileWidth / tileHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (imageAspect > tileAspect) {
          drawHeight = tileHeight;
          drawWidth = drawHeight * imageAspect;
          drawX = x - (drawWidth - tileWidth) / 2;
          drawY = y;
        } else {
          drawWidth = tileWidth;
          drawHeight = drawWidth / imageAspect;
          drawX = x;
          drawY = y - (drawHeight - tileHeight) / 2;
        }

        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to load image for tile ${index}:`, url, error);
        }
        const column = index % finalConfig.columns;
        const row = Math.floor(index / finalConfig.columns);
        const x = padding + column * (tileWidth + padding);
        const y = padding + row * (tileHeight + padding);

        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, tileWidth, tileHeight);
        ctx.fillStyle = '#666666';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image failed to load', x + tileWidth / 2, y + tileHeight / 2);
      }

      const tileInfo = getTileInfo(index, finalConfig);
      if (tileInfo) {
        tiles.push(tileInfo);
      }
    }),
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return {
    texture,
    tiles,
    tileSize: [tileWidth, tileHeight],
    tileCount: finalConfig.columns * finalConfig.rows,
  };
};

export const disposeAtlas = (atlas: AtlasResult): void => {
  atlas.texture.dispose();

  if (atlas.texture.image instanceof HTMLCanvasElement) {
    atlas.texture.image.width = 0;
    atlas.texture.image.height = 0;
  }
};

export const createUVAttribute = (tiles: AtlasTileInfo[]): Float32Array => {
  const array = new Float32Array(tiles.length * 2);

  tiles.forEach((tile, index) => {
    array[index * 2] = tile.uvOffset[0];
    array[index * 2 + 1] = tile.uvOffset[1];
  });

  return array;
};

export const getAtlasConfigForCount = (itemCount: number, preferredWidth = 2048): AtlasConfig => {
  const columns = Math.ceil(Math.sqrt(itemCount * (preferredWidth / preferredWidth)));
  const rows = Math.ceil(itemCount / columns);

  const config: AtlasConfig = {
    width: preferredWidth,
    height: preferredWidth,
    columns,
    rows,
    padding: 4,
    backgroundColor: '#1a1a1a',
  };

  if (validateAtlasConfig(config)) {
    return config;
  }

  return DEFAULT_ATLAS_CONFIG;
};
