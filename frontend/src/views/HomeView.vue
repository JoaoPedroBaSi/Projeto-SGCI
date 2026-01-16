<script setup lang="ts">
import NavbarHome from '@/layouts/NavbarHome.vue';
import { MapPin, Phone, Mail } from 'lucide-vue-next';
import homepageBg from '@/assets/homepage-photo.jpg';
</script>

<template>
  <div class="page-wrapper">
    <NavbarHome />

    <section id="inicio" class="hero-section" :style="{ backgroundImage: `url(${homepageBg})` }">
      <div class="hero-overlay"></div>

      <div class="container hero-container">

        <div class="conteudo-hero">
          <h2 class="texto-boas-vindas">
            Bem-Vindo ao SGCI, seu Sistema de Gerenciamento de Clínicas Integradas
          </h2>

          <h1>Cuidando da sua saúde com <span class="destaque">tecnologia</span> e carinho.</h1>

          <p class="texto-hero">
            Acompanhe seu histórico, verifique agendamentos e tenha o controle do seu bem-estar na palma da mão.
            Uma gestão clínica pensada para você.
          </p>
        </div>

      </div>
    </section>

    <footer id="contato" class="rodape">
      <div class="container">

        <div class="rodape-top">
          <div class="rodape-brand">
            <h2>SGCI</h2>
            <p>Excelência e inovação em gestão de saúde.</p>
          </div>

          <div class="rodape-info">
            <h3>Fale Conosco</h3>
            <ul class="lista-contato">
              <li>
                <div class="icone-wrapper">
                  <MapPin class="footer-icon" />
                </div>
                <div>
                  <strong>Endereço</strong><br>
                  Av. da Saúde, 123 - Centro
                </div>
              </li>
              <li>
                <div class="icone-wrapper">
                  <Phone class="footer-icon" />
                </div>
                <div>
                  <strong>Telefone</strong><br>
                  (84) 99999-9999
                </div>
              </li>
              <li>
                <div class="icone-wrapper">
                  <Mail class="footer-icon" />
                </div>
                <div>
                  <strong>E-mail</strong><br>
                  contato@sgci.com.br
                </div>
              </li>
            </ul>
          </div>

          <div class="rodape-info">
            <h3>Horário de Atendimento</h3>
            <ul class="lista-horario">
              <li><span>Seg - Sex:</span> <strong>07h às 18h</strong></li>
              <li><span>Sábado:</span> <strong>08h às 12h</strong></li>
              <li><span>Domingo:</span> <span class="fechado">Fechado</span></li>
            </ul>
          </div>
        </div>

        <div class="linha-divisoria"></div>

        <div class="rodape-bottom">
          <p class="copyright">&copy; 2026 SGCI. Feito com amor para cuidar de você.</p>
        </div>

      </div>
    </footer>
  </div>
</template>

<style scoped>
.page-wrapper {
  font-family: 'Montserrat', sans-serif;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding-top: 80px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: 1;
}

.hero-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
}

.conteudo-hero {
  max-width: 800px;
  color: white;
}

.texto-boas-vindas {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.conteudo-hero h1 {
  font-size: 3.5rem;
  line-height: 1.1;
  color: #ffffff;
  margin-bottom: 25px;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.destaque {
  color: #4dd0e1;
  position: relative;
  z-index: 1;
}

.destaque::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 10px;
  background-color: rgba(77, 208, 225, 0.3);
  z-index: -1;
  border-radius: 4px;
}

.texto-hero {
  font-size: 1.3rem;
  color: #f0f0f0;
  line-height: 1.6;
  max-width: 90%;
  margin: 0;
}

.rodape {
  background-color: #0f4c57;
  padding: 80px 0 30px 0;
  margin-top: auto;
}

.rodape h2,
.rodape h3,
.rodape p,
.rodape strong,
.rodape span,
.rodape div,
.rodape li {
  color: #ffffff !important;
}

.rodape-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
}

.rodape-brand h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #4dd0e1 !important;
}

.rodape-brand p {
  opacity: 0.8;
  max-width: 250px;
}

.rodape-info h3 {
  font-size: 1.3rem;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
  width: fit-content;
  display: inline-block;
}

.rodape-info h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: #4dd0e1;
  border-radius: 2px;
}

.lista-contato {
  list-style: none;
  padding: 0;
}

.lista-contato li {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.icone-wrapper {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.footer-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 2px;
}

.lista-horario {
  list-style: none;
  padding: 0;
}

.lista-horario li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 5px;
  width: 250px;
}

.fechado {
  color: #ffe082 !important;
  font-weight: bold;
  opacity: 1;
}

.linha-divisoria {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: 50px 0 30px 0;
}

.rodape-bottom {
  text-align: center;
}

.copyright {
  font-size: 0.9rem;
  opacity: 0.6;
}

@media (max-width: 900px) {

  .hero-container {
    justify-content: center;
    text-align: center;
  }

  .conteudo-hero h1 {
    font-size: 2.5rem;
  }

  .texto-hero {
    max-width: 100%;
    margin: 0 auto;
  }

  .rodape-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .rodape-info h3 {
    display: block;
    margin: 0 auto 25px auto;
  }

  .lista-contato li {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lista-horario li {
    width: 100%;
    max-width: 300px;
    margin: 0 auto 12px auto;
  }
}
</style>
