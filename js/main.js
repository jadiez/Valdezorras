// Initialize Firebase
var config = {
  apiKey: "AIzaSyALJwaHZMWvCxEghFma-fzkYpOCmJZfWU0",
  authDomain: "valdezorras-c08ad.firebaseapp.com",
  databaseURL: "https://valdezorras-c08ad.firebaseio.com",
  storageBucket: "valdezorras-c08ad.appspot.com",
};
firebase.initializeApp(config);

// Get a reference to the database service
var db = firebase.database();

// Get a reference to the authorize service
var aut = firebase.auth(),
    provider = new firebase.auth.GoogleAuthProvider();

// Variable Vue
var vm = new Vue({
    el: 'body',
    ready: function(){
     //Auth
      aut.onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            vm.autentificado=true;
            vm.usuarioActivo.nombre="Anonimo";
          } else {
            // No user is signed in.
            vm.autentificado=false;
            vm.usuarioActivo.nombre="";
          }
      });

      // Sincroniza datos con firebase
      db.ref('partidos/').on('value', function(snapshot){
        var tmpPartidos =snapshot.val();
        for (var partido in tmpPartidos){
          vm.partidos.push({
            "key" : partido,
            "equipoA" : tmpPartidos[partido].equipoA,
            "equipoB" : tmpPartidos[partido].equipoB,
            "fecha": tmpPartidos[partido].fecha,
            "notas": tmpPartidos[partido].notas
          });
        }
        vm.partidoActual = vm.partidos[vm.partidos.length-1];
        vm.punteroPartidos = vm.partidos.length-1 ;
        console.log("Actual: " + vm.partidoActual.fecha);
        console.log("Partido[" + vm.punteroPartidos +"]: " + vm.partidos[vm.punteroPartidos].fecha);
      });

      db.ref('jugadores/').on('value', function(snapshot){
        vm.jugadores=snapshot.val();
        vm.clasifica = [];
        var objeto = snapshot.val();
         for (var player in objeto){
             var ptos = (objeto[player].ganados | 0)*3 + (objeto[player].empatados | 0)*2 + (objeto[player].perdidos | 0);
             var jugados = (objeto[player].ganados | 0)+(objeto[player].empatados|0)+(objeto[player].perdidos|0);
             /*var mvp = (ptos*0.6 + (objeto[player].goles|0) * 0.1 + jugados* 0.3);*/
             vm.clasifica.push({
               "jugador" : player,
               "nombre": objeto[player].nombre,
               "jugados": jugados,
               "ganados": (objeto[player].ganados | 0),
               "empatados":objeto[player].empatados | 0,
               "perdidos":objeto[player].perdidos | 0,
               "goles" : objeto[player].goles | 0,
               "puntos" : ptos,
               /*"mvp" :  mvp.toFixed(1)*/
             });
         }
      });
      this.esperando=false;
    },

    // Metodos
    methods: {
      ordenarPor: function(columna){
        this.columnaOrdenNum = (this.columnaOrdenNum === 1)?-1:1;
        this.columnaOrden=columna;
        for(var col in this.orden){
          this.orden[col]=(col===columna)?true:false;
        };
      },
      conectar: function () {
        var clave = prompt("Introduce la clave", "" );
        this.partidoActual =  {
              fecha : "2016/01/01", notas : "",
              equipoA: {portero: {nombre: null ,goles:0},
                         latizq: {nombre: null ,goles:0},
                        latdcho: {nombre: null ,goles:0},
                        central: {nombre: null ,goles:0},
                         extizq: {nombre: null ,goles:0},
                        extdcho: {nombre: null ,goles:0},
                      delantero: {nombre: null ,goles:0}
                    },
              equipoB: {portero: {nombre: null ,goles:0},
                         latizq: {nombre: null ,goles:0},
                        latdcho: {nombre: null ,goles:0},
                        central: {nombre: null ,goles:0},
                         extizq: {nombre: null ,goles:0},
                        extdcho: {nombre: null ,goles:0},
                      delantero: {nombre: null ,goles:0}
                    }
        };
        if (clave !== null) {
          firebase.auth().signInWithEmailAndPassword("jadiez@fonotex.es", "Calecio").catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert (errorMessage);
            // ...
          });
          this.addPartidos = true;

          firebase.auth().signOut().then(function() {
            // Sign-out successful.
          }, function(error) {
            // An error happened.
          });
          this.verCrearPartidos=false;
          }
      },
      partidoAnterior: function(){
        if (this.punteroPartidos-1<0){
          alert ("Primer Partido");
        }else{
          this.punteroPartidos--;
        }
        this.partidoActual = this.partidos[this.punteroPartidos];
      },
      partidoSigiente: function(){
        if (this.punteroPartidos+1>this.partidos.length-1){
          alert ("Ultimo Partido");
        }else{
          this.punteroPartidos++;
        }
        this.partidoActual = this.partidos[this.punteroPartidos];
      },
      guardaPartido: function(){
        if(this.textoBoton2 =="Cancelar"){
          alert ("Operación cancelada");
        }else{
          //Añade pardido actual ala base de datos
          db.ref('partidos/').push({
            fecha : this.partidoActual.fecha,
            notas: "",
            equipoA: this.partidoActual.equipoA,
            equipoB: this.partidoActual.equipoB
          });

          //Actualizamos datos partidos en tabla jugadores
          // Variables
          var player="" , golesAntes=0 , ganadosAntes=0, perdidosAntes=0 , empatadosAntes=0 ;
          // ******************** GANADOR EQUIPO A **********

          // Si no existen los jugadores los creamos
          for(var ix in this.jugEquipoA){
            //Si no existe el jugador se cre nuevo
            if(!vm.jugadores[this.jugEquipoA[ix].nombre]){
              console.log("Creado jugador equipo A: " + this.jugEquipoA[ix].nombre);
              db.ref('jugadores/'+this.jugEquipoA[ix].nombre).set({
                ganados: 0,
                perdidos:0,
                empatados:0,
                goles: 0
              });
            }
          }
          for(ix in this.jugEquipoB){
           //Si no existe el jugador se cre nuevo
            if(!vm.jugadores[this.jugEquipoB[ix].nombre]){
              console.log("Creado jugador equipo B: " + this.jugEquipoB[ix].nombre);
              db.ref('jugadores/'+this.jugEquipoB[ix].nombre).set({
                ganados: 0,
                perdidos:0,
                empatados:0,
                goles: 0
              });
            }
          }
          // Fin creacion de usuarios

          // Actualizamos los goles y numero partidos ganados a los jugadores del equipo A
           if (this.golesEquipoA > this.golesEquipoB){
             for(ix in this.jugEquipoA){
                player = this.jugEquipoA[ix].nombre;
                ganadosAntes= (vm.jugadores[player].ganados |0);
                golesAntes  = (vm.jugadores[player].goles | 0);

                db.ref('jugadores/'+player).update({
                  ganados: ganadosAntes + 1,
                  goles: golesAntes + (this.jugEquipoA[ix].goles | 0)
                });
            }
            // Actualizamos los goles y numero partidos perdidos a los jugadores del equipo B
            for(var ix1 in vm.jugEquipoB){
              player = this.jugEquipoB[ix1].nombre;
              perdidosAntes=(vm.jugadores[player].perdidos |0);
              golesAntes  = (vm.jugadores[player].goles | 0);

              db.ref('jugadores/'+player).update({
                perdidos: perdidosAntes + 1,
                goles: golesAntes + (this.jugEquipoB[ix1].goles | 0)
              });
            }
          }
          else if(this.golesEquipoB > this.golesEquipoA){
            for(ix in vm.jugEquipoB){
              db.ref('jugadores/'+this.jugEquipoB[ix].nombre).update({
                ganados: (vm.jugadores[this.jugEquipoB[ix].nombre].ganados|0) + 1,
                goles: (vm.jugadores[this.jugEquipoB[ix].nombre].goles | 0) + (this.jugEquipoB[ix].goles | 0)
              });
            }
            for(ix in vm.jugEquipoA){
              db.ref('jugadores/'+this.jugEquipoA[ix].nombre).update({
                perdidos: (vm.jugadores[this.jugEquipoA[ix].nombre].perdidos|0) + 1,
                goles: (vm.jugadores[this.jugEquipoA[ix].nombre].goles | 0) + (this.jugEquipoA[ix].goles | 0)
              });
            }
          }else{
            for(var p5 in vm.jugEquipoB){
              db.ref('jugadores/'+this.jugEquipoB[p5].nombre).update({
                empatados: (vm.jugadores[this.jugEquipoB[p5].nombre].empatados|0)+1,
                goles: (vm.jugadores[this.jugEquipoB[p5].nombre].goles | 0) + (this.jugEquipoB[p5].goles | 0)
              });
            }
            for(var p6 in vm.jugEquipoA){
              db.ref('jugadores/'+this.jugEquipoA[p6].nombre).update({
                empatados: (vm.jugadores[this.jugEquipoA[p6].nombre].empatados|0)+1,
                goles: (vm.jugadores[this.jugEquipoA[p6].nombre].goles | 0) + (this.jugEquipoA[p6].goles | 0)
              });
            }
          }
          alert ("Partido Guardado");
        }
        // Asigna partidoActual al ultimo partido de la base de Datos
        this.partidoActual = this.partidos[this.partidos.length-1];
        this.addPartidos =false;
      }
    },

      //   //  Actualiza datos jugadores del partidoActual
      //   db.ref('jugadores/MOI').set({
      //     ganados:0,
      //     perdidos:1,
      //     empatados:0,
      //     goles: 0
      //   });
      //   db.ref('jugadores/IVAN').set({
      //     ganados:0,
      //     perdidos:1,
      //     empatados:0,
      //     goles: 1
      //   });

    // ########################  Datos
    data: {
      autentificado: true,
      addPartidos: false,
      verPartidos: false,
      usuarioActivo: {
        nombre: "",
        avatar: ""
      },
      partidoActual: [],
      partidos:[],
      punteroPartidos: 0,
      clasifica:[],
      jugadores:[],
      orden:{
        jugador: false,
        jugados: false,
        ganados: false,
        empatados: false,
        perdidos: false,
        goles:false,
        puntos: true
      },
      columnaOrden:'puntos',
      columnaOrdenNum: -1,
    },

    computed:{
      datosOK : function(){

         return this.partidoActual.fecha &&
                this.partidoActual.equipoA.portero.nombre &&
                this.partidoActual.equipoA.latizq.nombre &&
                this.partidoActual.equipoA.latdcho.nombre &&
                this.partidoActual.equipoA.central.nombre &&
                this.partidoActual.equipoA.extizq.nombre &&
                this.partidoActual.equipoA.extdcho.nombre &&
                this.partidoActual.equipoA.delantero.nombre &&
                this.partidoActual.equipoB.portero.nombre &&
                this.partidoActual.equipoB.latizq.nombre &&
                this.partidoActual.equipoB.latdcho.nombre &&
                this.partidoActual.equipoB.central.nombre &&
                this.partidoActual.equipoB.extizq.nombre &&
                this.partidoActual.equipoB.extdcho.nombre &&
                this.partidoActual.equipoB.delantero.nombre ;
      },
      numPartidos: function(){
        return this.jugadores.length-1;
      },
      golesEquipoA: function(){
          return parseInt(this.partidoActual.equipoA.portero.goles)+
                 parseInt(this.partidoActual.equipoA.latizq.goles)+
                 parseInt(this.partidoActual.equipoA.latdcho.goles)+
                 parseInt(this.partidoActual.equipoA.central.goles)+
                 parseInt(this.partidoActual.equipoA.extizq.goles)+
                 parseInt(this.partidoActual.equipoA.extdcho.goles)+
                 parseInt(this.partidoActual.equipoA.delantero.goles);
      },
      golesEquipoB: function(){
          return parseInt(this.partidoActual.equipoB.portero.goles)+
                 parseInt(this.partidoActual.equipoB.latizq.goles)+
                 parseInt(this.partidoActual.equipoB.latdcho.goles)+
                 parseInt(this.partidoActual.equipoB.central.goles)+
                 parseInt(this.partidoActual.equipoB.extizq.goles)+
                 parseInt(this.partidoActual.equipoB.extdcho.goles)+
                 parseInt(this.partidoActual.equipoB.delantero.goles);
      },
      textoBoton1: function(){
        return this.verPartidos ? "Clasificación" : "Ver Partidos";
      },
      textoBoton2: function(){
        return this.datosOK ? "Crea Partido" : "Cancelar";
      },
      jugEquipoA: function(){
        var equipo=[];
        equipo.push({nombre: this.partidoActual.equipoA.portero.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.portero.goles});
        equipo.push({nombre: this.partidoActual.equipoA.latizq.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.latizq.goles});
        equipo.push({nombre: this.partidoActual.equipoA.latdcho.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.latdcho.goles});
        equipo.push({nombre: this.partidoActual.equipoA.central.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.central.goles});
        equipo.push({nombre: this.partidoActual.equipoA.extizq.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.extizq.goles});
        equipo.push({nombre: this.partidoActual.equipoA.extdcho.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.extdcho.goles});
        equipo.push({nombre: this.partidoActual.equipoA.delantero.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoA.delantero.goles});
        return equipo;
      },
      jugEquipoB: function(){
        var equipo=[];
        equipo.push({nombre: this.partidoActual.equipoB.portero.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.portero.goles});
        equipo.push({nombre: this.partidoActual.equipoB.latizq.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.latizq.goles});
        equipo.push({nombre: this.partidoActual.equipoB.latdcho.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.latdcho.goles});
        equipo.push({nombre: this.partidoActual.equipoB.central.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.central.goles});
        equipo.push({nombre: this.partidoActual.equipoB.extizq.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.extizq.goles});
        equipo.push({nombre: this.partidoActual.equipoB.extdcho.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.extdcho.goles});
        equipo.push({nombre: this.partidoActual.equipoB.delantero.nombre.toUpperCase(),
                      goles: this.partidoActual.equipoB.delantero.goles});
        return equipo;
      }
    }

  });
