zombiBodies = []

var zombieKilledInRound = 0

class ZombieManager {
    constructor(zombies, positions, scene, world, player){
        positions.forEach((position) => {
            zombies.push(new Zombie(scene, world, player, position[0], position[1]));
        });
    }

    
}

class Zombie {
  constructor(scene, world, player, x, z) {
    this.scene = scene;
    this.world = world;
    this.player = player;

    this.zombie = null;
    this.mixer = null;
    this.body = null;

    this.idleAction = null;
    this.walkAction = null;
    this.attackAction = null;
    this.activeAction = null;
    this.currentAction = null;

    this.attackTrigger = null;
    this.attackTimer = 0;
    this.isAttacking = false;
    this.attackTriggerActive = false;

    this.attackTriggerActiveTime = 0.2; // Reducir tiempo activo (antes era indefinido)


    this.x = x;
    this.z = z;

    this.spawnx = x;
    this.spawnz = z;

    this.hp = 100;
    this.speed = 40

    this.deathAction = null;
    this.isDead = false;
    this.canTakeDamage = true;
    this.damageCooldown = 1; // segundos de invulnerabilidad tras recibir daño
    this.damageTimer = 0;
    this.idleDistance = 140;
    this.attackDistance = 20;

    this.loadZombieModel();
    zombiBodies.push(this);
  }

  // ----------------------------------------------------------
  // CARGA DEL MODELO Y ANIMACIONES
  // ----------------------------------------------------------
  reduceHP(damage) {
    if (this.isDead || !this.canTakeDamage) return;
    this.hp -= damage;

    // activar cooldown
    this.canTakeDamage = false;
    this.damageTimer = 0;

    // si muere
    if (this.hp <= 0) {
        this.die();
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    // Detener el cuerpo físico
    this.body.velocity.set(0, 0, 0);
    this.body.mass = 0; // ya no se mueve
    this.body.updateMassProperties();

    // Mover el cuerpo lejos para que no estorbe al jugador
    this.zombie.body.position.y = -20;

    // Desactivar ataques
    this.isAttacking = false;
    this.attackTriggerActive = false;

    // Cambiar animación a muerte
    if (this.deathAction) {
        this.fadeToAction(this.deathAction, 0.3);
        this.deathAction.clampWhenFinished = true;
        this.deathAction.loop = THREE.LoopOnce;
    } else {
        this.fadeToAction(this.idleAction, 0.2);
    }

  }

  
  recycle() {
      // Restaurar valores iniciales
      this.hp = 100;
      this.isDead = false;
      this.canTakeDamage = true;
      this.damageTimer = 0;
      this.attackTimer = 0;
      this.isAttacking = false;
      this.attackTriggerActive = false;

      // Reactivar masa
      this.body.mass = 1;
      this.body.updateMassProperties();

      // Resetear animaciones a idle
      if (this.idleAction) {
          this.fadeToAction(this.idleAction, 0.3);
      }

      // También reposicionar el trigger de ataque fuera del área
      if (this.attackTrigger) {
          this.attackTrigger.position.set(0, -35, 0);
      }

  }

  restart(x, z) {
    this.recycle()
    this.x = x;
    this.z = z;

    // Reposicionar el cuerpo físico
    if (this.body) {
      this.body.position.set(x, 1, z);
      this.body.velocity.set(0, 0, 0);
    }

    // Reposicionar el modelo 3D
    if (this.zombie) {
      this.zombie.position.set(x, 0, z);
    }

    // Reposicionar el trigger de ataque fuera de vista
    if (this.attackTrigger) {
      this.attackTrigger.position.set(x, 50, z);
    }

    // Resetear animación a idle si está cargada
    if (this.idleAction) {
      this.fadeToAction(this.idleAction, 0.3);
    }
  }

  loadZombieModel() {
    const loader = new THREE.FBXLoader();
    loader.load('models/zombi/Zombie Idle.fbx', (idleAnim) => {
        loader.load('models/zombi/Zombie Walk.fbx', (walkAnim) => {
            loader.load('models/zombi/Zombie Attack.fbx', (attackAnim) => {
                loader.load('models/zombi/Zombie Death.fbx', (deathAnim) => {
                    this.setUpAnimation(idleAnim, walkAnim, attackAnim, deathAnim);
                });
            });
        });
    });
  }

  setUpAnimation(idleAnim, walkAnim, attackAnim, deathAnim) {
    this.zombie = idleAnim;
    this.mixer = new THREE.AnimationMixer(this.zombie);

    this.idleAction = this.mixer.clipAction(this.zombie.animations[0]);
    this.currentAction = this.activeAction = this.idleAction;
    this.idleAction.play();

    this.zombie.scale.set(0.2, 0.2, 0.2);
    this.zombie.position.set(this.x, 0, this.z);
    this.scene.add(this.zombie);

    this.createZombiePhysicsBody();

    // Walk
    this.walkAction = this.mixer.clipAction(walkAnim.animations[0]);
    this.walkAction.setEffectiveWeight(1);
    this.enhanceAnimationClip(walkAnim.animations[0], 1.1);

    // Attack
    this.attackAction = this.mixer.clipAction(attackAnim.animations[0]);
    this.attackAction.setEffectiveWeight(1);
    this.attackAction.clampWhenFinished = true;
    this.attackAction.loop = THREE.LoopOnce;
    this.enhanceAnimationClip(attackAnim.animations[0], 1);

    // Death
    this.deathAction = this.mixer.clipAction(deathAnim.animations[0]);
    this.deathAction.setEffectiveWeight(1);
    this.deathAction.clampWhenFinished = true;
    this.deathAction.loop = THREE.LoopOnce;

    this.mixer.addEventListener('finished', (e) => {
        if (e.action === this.attackAction && !this.isDead) {
            this.fadeToAction(this.walkAction, 0.3);
        }
    });

    this.createAttackTrigger();
  }
  

  // ----------------------------------------------------------
  // CREAR COLLIDER FÍSICO DEL ZOMBI
  // ----------------------------------------------------------
  createZombiePhysicsBody() {
    const shape = new CANNON.Box(new CANNON.Vec3(8, 12, 8));
    this.body = new CANNON.Body({
      mass: 1,
      material: new CANNON.Material(),
      linearDamping: 0.1,
      angularDamping: 0.1,
  });
    this.body.addShape(shape);
    this.body.position.set(this.x, 1, this.z);

    this.world.addBody(this.body);
    this.zombie.body = this.body;
  }

  // ----------------------------------------------------------
  // CREAR TRIGGER DE ATAQUE
  // ----------------------------------------------------------
  createAttackTrigger() {
    const triggerRadius = 8;
    const triggerShape = new CANNON.Sphere(triggerRadius);
    this.attackTrigger = new CANNON.Body({ mass: 0 });
    this.attackTrigger.addShape(triggerShape);
    this.attackTrigger.collisionResponse = false;

    this.world.addBody(this.attackTrigger);

    this.attackTrigger.addEventListener('collide', function(e) {
        if (e.body.id === player.body.id && !isPlayerDead) {
          playerReduceHP(e.body.id)
        }
    });
  }


  // ----------------------------------------------------------
  // TRANSICIÓN ENTRE ANIMACIONES
  // ----------------------------------------------------------
  fadeToAction(newAction, duration = 0.5) {
    if (!newAction) return;
    if (this.currentAction && this.currentAction !== newAction) {
      this.currentAction.fadeOut(duration);
    }

    newAction.reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();

    this.currentAction = this.activeAction = newAction;

    if (newAction === this.attackAction) this.startAttack();
  }

  // ----------------------------------------------------------
  // ATAQUE
  // ----------------------------------------------------------
  startAttack() {
    this.isAttacking = true;
    this.attackTimer = 0;
    this.attackTriggerActive = false;
  }

  resetAttackTimer() {
    this.attackTimer = 0;
    this.isAttacking = false;
    this.attackTriggerActive = false;
  }

  // ----------------------------------------------------------
  // MEJORA DE ANIMACIÓN
  // ----------------------------------------------------------
  enhanceAnimationClip(clip, intensity) {
    clip.tracks.forEach(track => {
      if (track.name.includes('rotation')) {
        for (let i = 0; i < track.values.length; i++) {
          track.values[i] *= intensity;
        }
      } else if (track.name.includes('position')) {
        for (let i = 0; i < track.values.length; i += 3) {
          track.values[i] *= intensity;     // X
          track.values[i + 2] *= intensity; // Z
        }
      }
    });
  }

  // ----------------------------------------------------------
  // MOVIMIENTO DEL ZOMBI
  // ----------------------------------------------------------
  updateMovement(dx, dz, dir) {
    if (!this.zombie || !this.body) return;

    if (this.activeAction === this.walkAction) {
      const dirVec = new CANNON.Vec3(dx, 0, dz).unit();
      
      this.body.velocity.x = -dirVec.x * this.speed;
      this.body.velocity.z = -dirVec.z * this.speed;
    }

    if (this.activeAction === this.walkAction || this.activeAction === this.attackAction) {
      const angle = Math.atan2(dx, dz) + Math.PI;
      this.zombie.rotation.y = angle;
    }
  }

  // ----------------------------------------------------------
  // ACTUALIZACIÓN GENERAL
  // ----------------------------------------------------------
  update(delta) {
    if (!this.zombie) return;

    // --- Cooldown de daño ---
    if (!this.canTakeDamage) {
        this.damageTimer += delta;
        if (this.damageTimer >= this.damageCooldown) {
            this.canTakeDamage = true;
            this.damageTimer = 0;
        }
    }

    // --- Si está muerto, no hace nada ---
    if (this.isDead) {
        this.mixer.update(delta); // reproducir animación de muerte
        return;
    }
      
    const dx = this.zombie.position.x - this.player.position.x;
    const dz = this.zombie.position.z - this.player.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const dir = new CANNON.Vec3(dx, 0, dz).unit();

    this.updateMovement(dx, dz, dir);

    if (this.currentAction === this.idleAction && distance < this.idleDistance) {
      this.fadeToAction(this.walkAction, 0.4);
    } else if (this.currentAction === this.walkAction && distance < this.attackDistance) {
      this.fadeToAction(this.attackAction, 0.2);
    } else if (this.currentAction === this.walkAction && distance > this.idleDistance) {
      this.fadeToAction(this.idleAction, 0.5);
    }

    // Actualizar animaciones
    this.mixer.update(delta);

    if (this.body) {
      this.body.position.y = 1;
      this.body.velocity.y = 0;
      this.zombie.position.x = this.body.position.x - 1;
      if(!this.isDead){
        this.zombie.position.y = this.body.position.y - 1.1;
      }
      this.zombie.position.z = this.body.position.z - 2;

      // --- Lógica del trigger ---
      if (this.attackTrigger) {
        if (this.currentAction === this.attackAction && this.isAttacking) {
          this.attackTimer += delta;

          if (this.attackTimer >= 1.1 && !this.attackTriggerActive) {
            this.attackTriggerActive = true;
          }

          if (this.attackTriggerActive) {

            if(this.attackTimer <= 1.3){
              const attackDistance = 12;
              const attackOffset = new CANNON.Vec3(
              -dir.x * attackDistance,
              5,
              -dir.z * attackDistance
            );

            this.attackTrigger.position.x = this.body.position.x + attackOffset.x;
            this.attackTrigger.position.y = this.body.position.y + attackOffset.y;
            this.attackTrigger.position.z = this.body.position.z + attackOffset.z;
            }else{
              this.attackTrigger.position.set(this.body.position.x, 50, this.body.position.z);
            }

            
          }
        } else {
          this.attackTrigger.position.set(this.body.position.x, 50, this.body.position.z);
          if (this.isAttacking) this.resetAttackTimer();
        }
      }
    }
  }
}

function reiniciarZombis(room){
  var zombieSpawned = 0
  var maxZombies = 0
  var dispersion = 0
  
  // Determinar cantidad máxima de zombies y dispersión según puertas abiertas
  if (numOpenedDoors <= 2) {
    maxZombies = 2
    dispersion = 50 // Menos dispersión
  } else if (numOpenedDoors <= 4) {
    maxZombies = 5
    dispersion = 100 // Dispersión media
  } else {
    maxZombies = zombies.length // Todos los zombies
    dispersion = 150 // Dispersión completa
  }
  
  zombies.forEach(zombie => {
    if (zombieSpawned >= maxZombies) return
    
    var x = room.x + (Math.random() * dispersion - dispersion/2)
    var z = room.z + (Math.random() * dispersion - dispersion/2)
    
    zombie.restart(x, z)
    zombieSpawned = zombieSpawned + 1
  })
}



