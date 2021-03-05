const BackgroundGraphic = (() => {
  const svgns = 'http://www.w3.org/2000/svg';

  class BackgroundGraphic {
    constructor(container, colorPalette) {
      this.backgroundColor = colorPalette[0];
      this.rayColorPalette = colorPalette.slice(1);
      this.rays = [];

      const { root, svgRoot } = createRootElements();
      this.root = root;
      this.svgRoot = svgRoot;

      this.initRootElements();

      container.appendChild(this.root);

      this.startTime = Date.now();
    }

    onUpdate() {
      const now = Date.now();

      if (this.rays.length < 20 && Math.random() * this.rays.length < 2 * (1 - 4000 / (4000 + now - this.startTime))) {
        this.rays.push(this.spawnRay());
      }
      this.rays.forEach(ray => ray.onUpdate());

      for (let i = this.rays.length - 1; i >= 0; i--) {
        const ray = this.rays[i];
        if (now > ray.endTime + 1000) {
          ray.paths.forEach(path => path.remove());
          this.rays.splice(i, 1);
        }
      }
    }

    spawnRay() {
      let { offsetWidth: width, offsetHeight: height } = this.root;

      // viewBox is 0 0 100 100
      // normalize the container's width & height to svg viewBox
      const sizeMin = Math.min(width, height);
      const sizeMax = Math.max(width, height);
      width = 100 * width / sizeMax;
      height = 100 * height / sizeMax;

      const angle = Math.random() * Math.PI * 2;
      const startRadius = (25 + Math.random() * 20) * sizeMin / sizeMax;
      const endRadius = Math.hypot(width, height);
      const startTime = Date.now();
      const duration = 1000;
      const endTime = startTime + duration + 1400;
      const color1 = this.rayColorPalette[Math.floor(Math.random() * this.rayColorPalette.length)];
      const color2 = this.rayColorPalette[Math.floor(Math.random() * this.rayColorPalette.length)];

      const ray = new Ray(angle, startRadius, endRadius, duration, startTime, endTime, color1, color2);

      ray.paths.forEach(path => this.svgRoot.appendChild(path));

      return ray;
    }

    initRootElements() {
      this.root.classList.add('backgroundGraphic__root');
      this.root.style.backgroundColor = this.backgroundColor;

      this.svgRoot.classList.add('backgroundGraphic__svgRoot');
      this.svgRoot.setAttribute('xmlns', svgns);
      this.svgRoot.setAttribute('width', '100%');
      this.svgRoot.setAttribute('height', '100%');
      this.svgRoot.setAttribute('viewBox', '0 0 100 100');
    }
  }

  function createRootElements() {
    const root = document.createElement('div');
    const svgRoot = document.createElementNS(svgns, 'svg');
    root.appendChild(svgRoot);
    return { root, svgRoot };
  }

  class Ray {
    constructor(angle, startRadius, endRadius, duration, startTime, endTime, color1, color2) {
      this.angle = angle;
      this.startRadius = startRadius;
      this.endRadius = endRadius;
      this.duration = duration;
      this.startTime = startTime;
      this.endTime = endTime;
      this.color1 = color1;
      this.color2 = color2;

      this.angleOffset = (0.03 + (Math.random() ** 2) * 0.024) * (Math.floor(Math.random() * 2) * 2 - 1);
      this.timeOffset = 100 + (Math.random() ** 2) * 800;

      this.paths = createRayPathElements(color1, color2);
    }

    onUpdate() {
      const pathStrings = [0, 1].map((i) => {
        const angle = this.angle + i * this.angleOffset;
        const time = Date.now() - i * this.timeOffset;

        const t1 = (time - (this.startTime + this.duration)) / (this.endTime - (this.startTime + this.duration));
        const t2 = (time - this.startTime) / ((this.endTime - this.duration) - this.startTime);
        const startRadius = lerp(this.startRadius, this.endRadius, ease(clamp(0, 1, t1)));
        const endRadius = lerp(this.startRadius, this.endRadius, ease(clamp(0, 1, t2)));

        return rayPath(50, 50, angle, startRadius, endRadius);
      });

      if (this.paths.length === 1) {
        this.paths[0].setAttribute('d', pathStrings.join(' '));
      } else {
        this.paths.forEach((path, i) => path.setAttribute('d', pathStrings[i]));
      }
    }
  }

  function createRayPathElements(color1, color2) {
    if (color1 === color2) {
      const path = document.createElementNS(svgns, 'path');
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('fill', color1);
      return [path];
    } else {
      const path1 = document.createElementNS(svgns, 'path');
      path1.setAttribute('fill', color1);
      const path2 = document.createElementNS(svgns, 'path');
      path2.setAttribute('fill', color2);
      return [path1, path2];
    }
  }

  function rayPath(centerX, centerY, angle, startRadius, endRadius) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const startX = centerX + sin * startRadius;
    const startY = centerY + cos * startRadius;
    const endX = centerX + sin * endRadius;
    const endY = centerY + cos * endRadius;

    // scale = f/(f+Z)
    const focalLength = 100;
    const startZ = (100 * focalLength) / startRadius - focalLength;
    const endZ = (100 * focalLength) / endRadius - focalLength;

    const baseWidth = 3;

    const startWidth = baseWidth * focalLength / (focalLength + startZ);
    const startWidthX = cos * startWidth;
    const startWidthY = -sin * startWidth;

    const endWidth = baseWidth * focalLength / (focalLength + endZ);
    const endWidthX = cos * endWidth;
    const endWidthY = -sin * endWidth;

    return closedPath([
      [startX - startWidthX, startY - startWidthY],
      [startX + startWidthX, startY + startWidthY],
      [endX + endWidthX, endY + endWidthY],
      [endX - endWidthX, endY - endWidthY],
    ]);
  }

  function closedPath(data) {
    return data.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ') + ' z';
  }

  function ease(t) {
    return t ** 1.8;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(min, max, n) {
    return Math.min(max, Math.max(min, n));
  }

  return BackgroundGraphic;
})();