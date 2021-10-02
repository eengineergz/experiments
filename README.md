# gif.js

JavaScript GIF encoder that runs in your browser.

Uses typed arrays and web workers to render each frame in the background, it's really fast!


## Usage

Include `gif.js` found in `dist/` in your page. Also make sure to have `gif.worker.js` in the same location.

```javascript
var gif = new GIF({
  workers: 2,
  quality: 10,
});

// add an image element
gif.addFrame(imageElement);

// or a canvas element
gif.addFrame(canvasElement, { delay: 200 });

// or copy the pixels from a canvas context
gif.addFrame(ctx, { copy: true });

gif.on("finished", function (blob) {
  window.open(URL.createObjectURL(blob));
});

gif.render();
```

## Options

Options can be passed to the constructor or using the `setOptions` method.

| Name         | Default         | Description                                        |
| ------------ | --------------- | -------------------------------------------------- |
| repeat       | `0`             | repeat count, `-1` = no repeat, `0` = forever      |
| quality      | `10`            | pixel sample interval, lower is better             |
| workers      | `2`             | number of web workers to spawn                     |
| workerScript | `gif.worker.js` | url to load worker script from                     |
| background   | `#fff`          | background color where source image is transparent |
| width        | `null`          | output image width                                 |
| height       | `null`          | output image height                                |
| transparent  | `null`          | transparent hex color, `0x00FF00` = green          |
| dither       | `false`         | dithering method, e.g. `FloydSteinberg-serpentine` |
| debug        | `false`         | whether to print debug information to console      |

If width or height is `null` image size will be deteremined by first frame added.

Available dithering methods are:

- `FloydSteinberg`
- `FalseFloydSteinberg`
- `Stucki`
- `Atkinson`

You can add `-serpentine` to use serpentine scanning, e.g. `Stucki-serpentine`.

### addFrame options

| Name    | Default | Description                                        |
| ------- | ------- | -------------------------------------------------- |
| delay   | `500`   | frame delay                                        |
| copy    | `false` | copy the pixel data                                |
| dispose | `-1`    | frame disposal code. See [GIF89a Spec][gif89aspec] |

[gif89aspec]: https://www.w3.org/Graphics/GIF/spec-gif89a.txt
