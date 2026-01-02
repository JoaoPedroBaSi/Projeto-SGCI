<script setup lang="ts">
import NavbarHome from '@/components/NavbarHome.vue';
</script>

<template>
  <NavbarHome />

  <section id="inicio" class="hero-section">
    <div class="conteudo-hero">
      <h1>Cuidando da sua saúde com <span class="destaque">tecnologia</span></h1>
      <p>Agende consultas, acompanhe seu histórico e cuide do seu bem-estar com o Sistema de Gestão Clínica Integrada.</p>
      <div class="botoes-hero">
        <RouterLink to="/login" class="btn-primary">Agendar Consulta</RouterLink>
        <a href="#especialidades" class="btn-outline">Ver Especialidades</a>
      </div>
    </div>
    <div class="imagem-hero">
       <div class="img-placeholder">Imagem Ilustrativa da Clínica</div>
    </div>
  </section>

  <section id="profissionais" class="secao-branca">
    <div class="container">
      <h2>Nossos Profissionais</h2>
      <p class="subtitulo">Equipe qualificada pronta para te atender</p>

      <div class="grid-profissionais">
        <div class="card-prof">
          <div class="avatar">👨‍⚕️</div>
          <h3>Dr. Roberto Silva</h3>
          <p>Cardiologista</p>
        </div>
        <div class="card-prof">
          <div class="avatar">👩‍⚕️</div>
          <h3>Dra. Ana Maria</h3>
          <p>Dermatologista</p>
        </div>
        <div class="card-prof">
          <div class="avatar">👨‍⚕️</div>
          <h3>Dr. Carlos Souza</h3>
          <p>Ortopedista</p>
        </div>
      </div>
    </div>
  </section>

  <section id="especialidades" class="secao-colorida">
    <div class="container">
      <h2>Especialidades</h2>
      <div class="grid-especialidades">
        <div class="pill">🩺 Clínica Geral</div>
        <div class="pill">❤️ Cardiologia</div>
        <div class="pill">🦴 Ortopedia</div>
        <div class="pill">👶 Pediatria</div>
        <div class="pill">🧠 Neurologia</div>
        <div class="pill">👁️ Oftalmologia</div>
        <div class="pill">🔬 Dermatologia</div>
        <div class="pill">🥗 Nutrição</div>
      </div>
    </div>
  </section>

  <footer id="contato" class="rodape">
    <div class="container">

      <div class="rodape-conteudo">
        <div class="rodape-col">
          <h3>Fale Conosco</h3>
          <p>Estamos prontos para tirar suas dúvidas.</p>
          <ul class="lista-contato">
            <li>
              <span>📍</span> Av. da Saúde, 123 - Centro
            </li>
            <li>
              <span>📞</span> (84) 99999-9999
            </li>
            <li>
              <span>✉️</span> contato@sgci.com.br
            </li>
          </ul>
        </div>

        <div class="rodape-col">
          <h3>Horário de Atendimento</h3>
          <p>Segunda a Sexta: 07h às 18h</p>
          <p>Sábado: 08h às 12h</p>
        </div>
      </div>

      <div class="linha-divisoria"></div>

      <p class="copyright">&copy; 2025 SGCI - Sistema de Gestão Clínica Integrada. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
/* CONFIGURAÇÕES GERAIS */
section {
  padding: 80px 20px;
  scroll-margin-top: 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  font-size: 2.5rem;
  color: #1C8E9D;
  text-align: center;
  margin-bottom: 10px;
}

.subtitulo {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

/* HERO SECTION */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 120px;
  background-color: #f4fcfd;
  min-height: 90vh;
  gap: 50px;
  flex-wrap: wrap;
}

.conteudo-hero { max-width: 500px; }

.conteudo-hero h1 {
  font-size: 3rem;
  line-height: 1.2;
  color: #333;
  margin-bottom: 20px;
}

.destaque { color: #1C8E9D; }

.botoes-hero {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary {
  background-color: #1C8E9D;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
}

.btn-outline {
  border: 2px solid #1C8E9D;
  color: #1C8E9D;
  padding: 12px 24px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
}

.img-placeholder {
  width: 400px;
  height: 300px;
  background-color: #ddd;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-weight: bold;
}

/* PROFISSIONAIS */
.secao-branca { background-color: #ffffff; }

.grid-profissionais {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.card-prof {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.3s;
  border: 1px solid #eee;
}

.card-prof:hover { transform: translateY(-5px); }

.avatar {
  font-size: 4rem;
  margin-bottom: 10px;
}

/* ESPECIALIDADES */
.secao-colorida {
  background-color: #1C8E9D;
  color: white;
}
.secao-colorida h2 { color: white; }

.grid-especialidades {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.pill {
  background-color: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 500;
}

/* RODAPÉ E CONTATO */
.rodape {
  background-color: #333;
  color: #ddd;
  padding: 60px 20px 20px 20px;
  scroll-margin-top: 60px;
}

.rodape-conteudo {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 40px;
}

.rodape-col h3 {
  color: white;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.lista-contato {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.lista-contato li {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
}

.linha-divisoria {
  height: 1px;
  background-color: rgba(255,255,255,0.1);
  margin: 20px 0;
}

.copyright {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.7;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .hero-section { flex-direction: column-reverse; text-align: center; padding-top: 100px;}
  .botoes-hero { justify-content: center; }
  .img-placeholder { width: 100%; max-width: 350px; }
  .rodape-conteudo { flex-direction: column; text-align: center; }
  .lista-contato li { justify-content: center; }
}
</style>
