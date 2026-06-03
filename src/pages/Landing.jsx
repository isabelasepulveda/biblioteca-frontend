import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-indigo-900/90 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* 🔵 IMÁGENES DE FONDO (efecto de biblioteca) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
      </div>

      {/* ✨ Círculos decorativos flotantes */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* 📦 CONTENIDO PRINCIPAL (FLOTANDO, COMO QUERÍAS) */}
      <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-10 md:p-14 max-w-3xl w-full mx-4">
        
        {/* 📚 Logo y título */}
        <div className="mb-10">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-2xl mx-auto mb-6 border-4 border-white/30">
            <span className="text-white text-5xl font-bold">📚</span>
          </div>
          
          <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-black text-white tracking-tight mb-3 drop-shadow-lg">
            Biblioteca Web
          </h1>
          
          <p className="text-blue-100 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Tu espacio digital para leer, aprender y descubrir. Accede a miles de libros, gestiona tus préstamos y mucho más.
          </p>
        </div>

        {/* 🖼️ IMAGEN DESTACADA */}
        <div className="w-full h-48 md:h-60 rounded-xl overflow-hidden shadow-xl mb-8 border-4 border-white/20">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Estante de libros" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* 🎯 BOTONES PRINCIPALES */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mx-auto">
          <Link 
            to="/login" 
            className="flex-1 py-4 bg-white/95 text-blue-900 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-lg hover:-translate-y-1.5 transition-all transform border-2 border-white/30 backdrop-blur-sm"
          >
            🔑 INICIAR SESIÓN
          </Link>

          <Link 
            to="/registro" 
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-lg hover:-translate-y-1.5 transition-all transform border-2 border-white/20"
          >
            📝 REGISTRARSE
          </Link>
        </div>

        {/* 📌 Frase abajo */}
        <p className="mt-8 text-blue-200 text-sm italic">
          "Un libro es un sueño que tienes en la mano"
        </p>
      </div>

      {/* 👣 Pie de página */}
      <footer className="absolute bottom-4 text-blue-200 text-xs z-10">
        © 2026 Biblioteca Web - Todos los derechos reservados
      </footer>
    </div>
  );
}