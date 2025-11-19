// p5.js "Neural Constellation" background for the landing page.
// Uses global mode (setup/draw/windowResized) and attaches to #p5-canvas-container.

let particles = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-canvas-container');

  // Responsive particle count
  const particleCount = Math.min(windowWidth / 10, 100);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  clear(); // Keep background transparent over the page

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.move();
    p.display();
    p.joinParticles(particles.slice(i));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  particles = [];
  const particleCount = Math.min(windowWidth / 10, 100);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

class Particle {
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.r = random(1, 3);
    this.xSpeed = random(-0.5, 0.5);
    this.ySpeed = random(-0.5, 0.5);
    this.color = color(99, 102, 241); // Indigo base
  }

  move() {
    if (this.x < 0 || this.x > width) this.xSpeed *= -1;
    if (this.y < 0 || this.y > height) this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  display() {
    noStroke();
    fill(255, 255, 255, 150);
    circle(this.x, this.y, this.r);
  }

  joinParticles(others) {
    others.forEach(other => {
      const d = dist(this.x, this.y, other.x, other.y);
      if (d < 120) {
        const alpha = map(d, 0, 120, 0.3, 0); // fade with distance
        stroke('rgba(99, 102, 241, ' + alpha + ')');
        strokeWeight(1);
        line(this.x, this.y, other.x, other.y);
      }
    });
  }
}
