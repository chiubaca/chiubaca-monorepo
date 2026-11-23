"""Generate seamless brushed-metal texture tiles used by the ID card UI.

No external services: pure numpy + PIL. The wrapped blur makes the tiles
seamless in both directions so they can be repeated as CSS backgrounds.
"""

from pathlib import Path

import numpy as np
from PIL import Image

SIZE = 1024
rng = np.random.default_rng(20261123)


def wrapped_blur(a: np.ndarray, radius: int, axis: int) -> np.ndarray:
    """Box blur with wraparound so the result tiles seamlessly."""
    out = np.zeros_like(a)
    weights = 2 * radius + 1
    for shift in range(-radius, radius + 1):
        out += np.roll(a, shift, axis=axis)
    return out / weights


def brushed_streaks(size: int, axis: int, coarse: float, fine: float) -> np.ndarray:
    # Long correlated grain along the brush axis, wrapped for tiling.
    line = rng.normal(0, 1, (1, size))
    lines = np.repeat(line, size, axis=0)
    lines = wrapped_blur(lines, coarse, axis=1 - axis)
    lines = wrapped_blur(lines, fine, axis=axis)
    noise = rng.normal(0, 1, (size, size))
    noise = wrapped_blur(noise, fine, axis=axis)
    return 0.72 * lines + 0.28 * noise


def save_tile(path: Path, rgb: np.ndarray) -> None:
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").save(path, optimize=True)


def main() -> None:
    here = Path(__file__).parent

    # Diagonal dark carbon/brushed steel for the card surface and page.
    grain = brushed_streaks(SIZE, axis=1, coarse=9, fine=2)
    sheen = np.sin(np.linspace(0, 2 * np.pi, SIZE, endpoint=False))[None, :]
    dark = np.stack(
        [
            22 + grain * 3.4 + sheen * 2.2,
            24 + grain * 3.6 + sheen * 2.4,
            29 + grain * 4.0 + sheen * 2.8,
        ],
        axis=-1,
    )
    save_tile(here / "metal-dark.png", dark)

    # Bright brushed silver for corner panels and wedge hardware.
    sgrain = brushed_streaks(SIZE, axis=0, coarse=7, fine=1)
    ssheen = np.sin(np.linspace(0, 6 * np.pi, SIZE, endpoint=False))[:, None]
    silver = np.stack(
        [
            186 + sgrain * 17 + ssheen * 12,
            191 + sgrain * 17 + ssheen * 12,
            197 + sgrain * 18 + ssheen * 13,
        ],
        axis=-1,
    )
    save_tile(here / "metal-silver.png", silver)


if __name__ == "__main__":
    main()
