let ps;

let attractor;

let saveFrames = false;

stars = [];

function setup() {
  createCanvas(600, 600, WEBGL);
  
  // Initializing Particle System
  let cl = createVector(0, 0);
  let d = width/3;
  let mp = 250000;
  ps = new ParticleSystem(cl, d, mp);
  
  // Initializing Attractor
  let x = 0//width/2;
  let y = 0//height/2;
  let m = 100;
  attractor = new Attractor(x, y, m);
  
  for (var i = 0; i < 150; i++) {
     let distance = random(width/3, width);
     let angle = random(TWO_PI);
     let dimension = random(1, 3);
     let s = createVector((cos(angle)*distance)+width/2, (sin(angle)*distance)+height/2, dimension);
     stars.push(s);
  }
}

function draw() {
  
  background(8, 15, 23);
  
  for (var i = 0; i < stars.length; i++) {
    let s = stars[i];
    stroke(255, 175);
    strokeWeight(s.z);
    //strokeCap(ROUND);
    point(s.x, s.y);
  }
  
  ps.run(attractor);
  
  if(saveFrames == true) {
    saveFrame("moon####.jpg");
 }
}
class Attractor { 
  constructor(x, y, m) { //float x, float y, floatm
    this.mass = m;
    this.G = 0.1;
    this.location = createVector(x, y);
    this.dragging = false;
    this.rollover = false;
    this.dragOffset = createVector(0.0, 0.0);

  }

    attract(m) {
    let force = p5.Vector.sub(this.location, m.location);   
    let d = force.mag();                              
    d = constrain(d, 5.0, 25.0);                        
    force.normalize();                                  
    let strength = (this.G * this.mass * m.mass) / (d * d);      
    force.mult(strength);                                  
    return force;
  } 

   xpos() {
    return this.location.x;
  }

   ypos() {
    return this.location.y;
  }

   mass() {
    return this.mass;
  }
}

// Separation
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code, 2011

// Vehicle class

class Particle {
  constructor(x, y, l, o) {
    this.location = createVector(x, y);
    this.mass = 1;
    this.r = 4;
    this.maxspeed = 6;
    this.maxforce = 0.1;
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    //life = random(0.5, 1);
    this.life = l;
    this.olding = o;
    this.dead = false;
  }

   applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force); //RB it was originally .add(force)
  }

  // Separation
  // Method checks for nearby vehicles and steers away
   separate (particles) {
    let desiredseparation = r*2;
    let sum = createVector();
    let count = 0;
    // For every boid in the system, check if it's too close
   for (var i = 0; i < particles.length; i++) {
    let d = P5.Vector.dist(this.location, particles[i].location);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
         let diff = p5.Vector.sub(this.location, particles[i].location);
         diff.normalize();
         diff.div(d);        // Weight by distance
         sum.add(diff);
         count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      sum.div(count);
      // Our desired vector is the average scaled to maximum speed
      sum.normalize();
      sum.mult(this.maxspeed);
      // Implement Reynolds: Steering = Desired - Velocity
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  }



  // Method to update location
   update() {
    // Update velocity
    this.velocity.add(this.acceleration); //RB Originally .add(this.accel)
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.location.add(this.velocity); //RB Originally .add(this.vel)
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
    
    
    this.life -= this.olding;
    if (this.life < 0.0) {
      this.dead = true;
    }
  }

    display() {
    fill(255);
    stroke(255, 255*this.life);
    strokeWeight(1.2);
    push();
    //blendMode(ADD);
    translate(this.location.x, this.location.y);
    point(0, 0);
    ellipse(0, 0, this.r, this.r);
    pop();
  }
  
  xpos() {
    return this.location.x;
  }
  
  ypos() {
    return this.location.y;
  }
  
  isDead() {
    return this.dead;
  }
}






class ParticleSystem {
  constructor(cl,d,mp) { //pvector cl

    this.particles = [];

    this.centerLocation = cl; //RB should get() be get[]
    this.dimen = d;
    this.max_particles = mp;
  }

  addParticles() {
    if (this.particles.length < this.max_particles) {
      for (let i = 0; i < 2000; i++) {
        //float angle = random(PI)-PI/1.6;
        let angle = random(PI);
        let life = map(sin(angle), 0, 1, 0.5, 1);
        let olding = map(sin(angle), 0, 1, 0.019, 0.011);
        angle -= PI/1.5;
        let p = new Particle((cos(angle)*this.dimen)+this.centerLocation.x, (sin(angle)*this.dimen)+this.centerLocation.y, life, olding);
         this.particles.push(p);
      }
    }
  }

  runParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      let v = this.particles[i];
      
      // Call the generic run method (update, display)
      v.update();
      v.display();

      if (v.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  applyGravity(a) {
    for (let i = 0; i < this.particles.length; i++) { //RB originally .size
      let force = a.attract(this.particles[i]);
      this.particles[i].applyForce(force);
    }
  }
  
  run(a) {
    this.addParticles();
    this.runParticles();
    this.applyGravity(a);
  }
}
         