(function () {
  var container = document.getElementById('p5-canvas-container');
  if (!container || typeof window.p5 === 'undefined') return;

  var cfg = {
    count: parseInt(container.dataset.count || '120', 10),
    dot: container.dataset.dot || 'rgba(139, 92, 246, 0.5)',
    line: container.dataset.line || 'rgba(139, 92, 246, 0.15)'
  };

  new p5(function (p) {
    var particles = [];

    function Particle() {
      this.x = p.random(0, p.width);
      this.y = p.random(0, p.height);
      this.r = p.random(1, 4);
      this.xSpeed = p.random(-0.5, 0.5);
      this.ySpeed = p.random(-0.5, 0.5);
    }

    Particle.prototype.createParticle = function () {
      p.noStroke();
      p.fill(cfg.dot);
      p.circle(this.x, this.y, this.r);
    };

    Particle.prototype.moveParticle = function () {
      if (this.x < 0 || this.x > p.width) this.xSpeed *= -1;
      if (this.y < 0 || this.y > p.height) this.ySpeed *= -1;
      this.x += this.xSpeed;
      this.y += this.ySpeed;
    };

    Particle.prototype.joinParticles = function (others) {
      for (var i = 0; i < others.length; i++) {
        var o = others[i];
        var d = p.dist(this.x, this.y, o.x, o.y);
        if (d < 90) {
          p.stroke(cfg.line);
          p.line(this.x, this.y, o.x, o.y);
        }
      }
    };

    p.setup = function () {
      var canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.parent('p5-canvas-container');
      for (var i = 0; i < cfg.count; i++) {
        particles.push(new Particle());
      }
    };

    p.draw = function () {
      p.background('#111827');
      for (var i = 0; i < particles.length; i++) {
        var part = particles[i];
        part.createParticle();
        part.moveParticle();
        part.joinParticles(particles.slice(i));
      }
    };

    p.windowResized = function () {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  });
})();

