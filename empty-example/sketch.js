let ps;

let attractor;

let saveFrames = false;

stars = new ArrayList();

function setup() {
  size(600, 600, OPENGL);
  
  // Initializing Particle System
  let cl = new PVector(width/2, height/2);
  let d = width/3;
  let mp = 250000;
  let ps = new ParticleSystem(cl, d, mp);
  
  // Initializing Attractor
  let x = width/2;
  let y = height/2;
  let m = 100;
  let attractor = new Attractor(x, y, m);
  
  for (var i = 0; i < 150; i++) {
     let distance = random(width/3, width);
     let angle = random(TWO_PI);
     let dimension = random(1, 3);
     let s = new PVector((cos(angle)*distance)+width/2, (sin(angle)*distance)+height/2, dimension);
     stars.add(s);
  }
}

function draw() {
  
  background(8, 15, 23);
  
  for (var i = 0; i < stars.size(); i++) {
    let s = stars.get(i);
    stroke(255, 175);
    strokeWeight(s.z);
    strokeCap(ROUND);
    point(s.x, s.y);
  }
  
  ps.run(attractor);
  
  if(saveframes == true) {
    saveFrame("moon####.jpg");
  }
}
class Attractor { 
  Constructor(x, y, m) { //float x, float y, floatm
    this.mass = m;
    this.G = 0.1;
    this.location = new PVector(x, y);
    this.dragging = false;
    this.rollover = false;
    this.dragOffset = new PVector(0.0, 0.0);

  }

    Attractor(Particle m) {
    let force = PVector.sub(location, m.location);   
    let d = force.mag();                              
    d = constrain(d, 5.0, 25.0);                        
    force.normalize();                                  
    let strength = (G * mass * m.mass) / (d * d);      
    force.mult(strength);                                  
    return force;
  } 

   xpos() {
    return location.x;
  }

   ypos() {
    return location.y;
  }

   mass() {
    return mass;
  }
}

// Separation
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code, 2011

// Vehicle class

class Particle {
  Constructor(x, y, l, o) {
    this.location = new PVector(x, y);
    this.mass = 1;
    this.r = 4;
    this.maxspeed = 6;
    this.maxforce = 0.1;
    this.acceleration = new PVector(0, 0);
    this.velocity = new PVector(random(-0.5, 0.5), random(-0.5, 0.5));
    //life = random(0.5, 1);
    this.life = l;
    this.olding = o;
    let dead = false;
  }

   applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }

  // Separation
  // Method checks for nearby vehicles and steers away
   separate (particles) {
    let desiredseparation = r*2;
    let sum = new PVector();
    let count = 0;
    // For every boid in the system, check if it's too close
    for (Particle other particles) {
       d = PVector.dist(location, other.location);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
         diff = PVector.sub(location, other.location);
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
      sum.mult(maxspeed);
      // Implement Reynolds: Steering = Desired - Velocity
      let steer = PVector.sub(sum, velocity);
      steer.limit(maxforce);
      applyForce(steer);
    }
  }



  // Method to update location
  function update() {
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.limit(maxspeed);
    location.add(velocity);
    // Reset accelertion to 0 each cycle
    acceleration.mult(0);
    
    
    life -= olding;
    if (life < 0.0) {
      dead = true;
    }
  }

  function display() {
    fill(255);
    stroke(255, 255*life);
    strokeWeight(1.2);
    push();
    //blendMode(ADD);
    translate(location.x, location.y);
    point(0, 0);
    //ellipse(0, 0, r, r);
    pop();
  }
  
  function xpos() {
    return location.x;
  }
  
  function ypos() {
    return location.y;
  }
  
  function isDead() {
    return dead;
  }
}






class ParticleSystem {
  Constructor(let cl, let float d, let int mp) { //pvector cl

    this.particles = new ArrayList<Particle>();

    this.centerLocation = cl.get();
    this.dimen = d;
    this.max_particles = mp;
  }

  addParticles() {
    if (particles.size() < max_particles) {
      for (int i = 0; i < 2000; i++) {
        //float angle = random(PI)-PI/1.6;
        let angle = random(PI);
        let life = map(sin(angle), 0, 1, 0.5, 1);
        let olding = map(sin(angle), 0, 1, 0.019, 0.011);
        let angle -= PI/1.5;
        let p = new Particle((cos(angle)*dimen)+centerLocation.x, (sin(angle)*dimen)+centerLocation.y, life, olding);
        let particles.add(p);
      }
    }
  }

  runParticles() {
    for (int i = 0; i < particles.size (); i++) {
      let v = particles.get(i);
      
      // Call the generic run method (update, display)
      v.update();
      v.display();

      if (v.isDead()) {
        particles.remove(i);
      }
    }
  }
  
  applyGravity(Attractor a) {
    for (Particle p : particles) {
      PVector force = a.attract(p);
      p.applyForce(force);
    }
  }
  
  run(Attractor a) {
    addParticles();
    runParticles();
    applyGravity(a);
  }
}