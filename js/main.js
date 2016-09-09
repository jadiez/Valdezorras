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
      db.ref('partidos/-KR5Jb60demTLQ6i5QR8').on('value', function(snapshot){
        vm.partidoActual=snapshot.val();
      });

      db.ref('jugadores/').on('value', function(snapshot){
        vm.jugadores=snapshot.val();
        vm.clasifica = [];
        var objeto = snapshot.val();
         for (var player in objeto){
             var ptos = (objeto[player].ganados | 0)*3 + (objeto[player].empatados | 0)*2 + (objeto[player].perdidos | 0);
             var jugados = (objeto[player].ganados | 0)+(objeto[player].empatados|0)+(objeto[player].perdidos|0);
             var mvp = (ptos*0.6 + (objeto[player].goles|0) * 0.1 + jugados* 0.3);
             vm.clasifica.unshift({
               "jugador" : player,
               "nombre": objeto[player].nombre,
               "jugados": jugados,
               "ganados": (objeto[player].ganados | 0),
               "empatados":objeto[player].empatados | 0,
               "perdidos":objeto[player].perdidos | 0,
               "goles" : objeto[player].goles | 0,
               "puntos" : ptos,
               "mvp" :  mvp.toFixed(1)
             });
         }
      });
    },

    // Metodos
    methods: {
      conectar: function () {
        if (!this.autentificado){
        firebase.auth().signInWithEmailAndPassword("jadiez@fonotex.es", "Mekivel1").catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
        this.verCrearPartidos = true;
        }else{
        firebase.auth().signOut().then(function() {
          // Sign-out successful.
        }, function(error) {
          // An error happened.
        });
        this.verCrearPartidos=false;
        }
      },

      // guardarPartido: function(){
      //   // db.ref('partidos/').push({
      //   //   fecha : this.partidoActual.fecha,
      //   //   notas: "",
      //   //   equipoA: this.partidoActual.equipoA,
      //   //   equipoB: this.partidoActual.equipoB
      //   // });
      //
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

        // if (this.golesEquipoA > this.golesEquipoB){
        //     for(var ix in vm.jugEquipoA){
        //       player= vm.jugEquipoA[ix].toUpperCase() | "indefinido";
        //       console.log(player);
        //       if(!vm.jugadores[player]){
        //         db.ref('jugadores/'+player).set({
        //           ganados:0,
        //           perdidos:0,
        //           empatados:0
        //         });
        //       }
        //         _ganados = vm.jugadores[player]["ganados"] ;
        //         _goles  = vm.jugadores[player]["goles"];
        //         db.ref('jugadores/'+player).update({
        //           ganados: _ganados + 1,
        //           goles: _goles + 1
        //         });
        //     }
        //     for(var ix1 in vm.jugEquipoB){
        //       player= vm.jugEquipoB[ix].toUpperCase() | "indefinido";
        //       if(!vm.jugadores[player]){
        //         db.ref('jugadores/'+player).set({
        //           ganados:0,
        //           perdidos:0,
        //           empatados:0
        //         });
        //       }
        //       _perdidos = (vm.jugadores[player]["perdidos"] | 0);
        //       _goles  = (vm.jugadores[player]["goles"] | 0);
        //       db.ref('jugadores/'+player).update({
        //         perdidos: _perdidos + 1,
        //         goles: (this.jugadores[vm.jugEquipoA[ix1]]["goles"] | 0) + 1
        //       });
        //     }


        // } else if(this.golesEquipoB > this.golesEquipoA){
        //   for(var ix2 in vm.jugEquipoB){
        //     db.ref('jugadores/'+vm.jugEquipoB[ix2].toUpperCase()).update({
        //       ganados: (this.jugadores[vm.jugEquipoB[ix2]].ganados|0) + 1,
        //       goles: (this.jugadores[vm.jugEquipoA[ix2]].goles | 0) + 1
        //     });
        //   }
        //   for(var p4 in vm.jugEquipoA){
        //     db.ref('jugadores/'+vm.jugEquipoB[p4].toUpperCase()).update({
        //       perdidos: (this.jugadores[vm.jugEquipoA[p4]].perdidos|0)+1,
        //       goles: (this.jugadores[vm.jugEquipoA[p4]].goles | 0) + 1
        //     });
        //   }
        // } else{
        //   for(var p5 in vm.jugEquipoB){
        //     db.ref('jugadores/'+vm.jugEquipoB[p5]).update({
        //       empatados: (this.jugadores[vm.jugEquipoB[p5]].empatados|0)+1,
        //       goles: (this.jugadores[vm.jugEquipoA[p5]].goles | 0) + 1
        //     });
        //   }
        //   for(var p6 in vm.jugEquipoA){
        //     db.ref('jugadores/'+vm.jugEquipoA[p6]).update({
        //       empatados: (this.jugadores[vm.jugEquipoA[p6]].empatados|0)+1,
        //       goles: (this.jugadores[vm.jugEquipoA[p6]].goles | 0) + 1
        //     });
        //   }
        // }
        // alert("Datos guardado");

    },

    // ########################  Datos
    data: {
      autentificado: true,
      verPartidos: false,
      usuarioActivo: {
        nombre: "",
        avatar: ""
      },
      partidoActual: [],
      // {
      //       fecha : "",
      //       notas : "",
      //       equipoA: {portero: {goles:0}, latizq: {goles:0}, latdcho: {goles:0}, central: {goles:0}, extizq: {goles:0}, extdcho: {goles:0},  delantero: {goles:0}},
      //       equipoB: {portero: {goles:0}, latizq: {goles:0}, latdcho: {goles:0}, central: {goles:0}, extizq: {goles:0}, extdcho: {goles:0},  delantero: {goles:0}}
      // }
      partidos:[],
      clasifica:[],
      jugadores:[],
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
      jugEquipoA: function(){
        var equipo=[];
        equipo.push(this.partidoActual.equipoA.portero.nombre);
        equipo.push(this.partidoActual.equipoA.latizq.nombre);
        equipo.push(this.partidoActual.equipoA.latdcho.nombre);
        equipo.push(this.partidoActual.equipoA.central.nombre);
        equipo.push(this.partidoActual.equipoA.extizq.nombre);
        equipo.push(this.partidoActual.equipoA.extdcho.nombre);
        equipo.push(this.partidoActual.equipoA.delantero.nombre);
        console.log("equipoA:" + equipo);
        return equipo;
      },
      jugEquipoB: function(){
        var equipo=[];
        equipo.push(this.partidoActual.equipoB.portero.nombre);
        equipo.push(this.partidoActual.equipoB.latizq.nombre);
        equipo.push(this.partidoActual.equipoB.latdcho.nombre);
        equipo.push(this.partidoActual.equipoB.central.nombre);
        equipo.push(this.partidoActual.equipoB.extizq.nombre);
        equipo.push(this.partidoActual.equipoB.extdcho.nombre);
        equipo.push(this.partidoActual.equipoB.delantero.nombre);
        return equipo;
      }
    }

  });
