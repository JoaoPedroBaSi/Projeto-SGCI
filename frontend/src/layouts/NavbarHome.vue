<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref } from 'vue';

const menuAberto = ref(false);

function alternarMenuMobile() {
  menuAberto.value = !menuAberto.value;
}
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="logo-area">
        <img src="@/assets/logo-sgci.png" alt="Logo SGCI" class="logo-img" />
        <span class="logo-text">SGCI</span>
      </div>

      <button class="menu-toggle" @click="alternarMenuMobile">☰</button>

      <nav class="nav-links" :class="{ 'ativo': menuAberto }">
        <RouterLink to="/autenticacao" class="btn-entrar">
          Entrar
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>

.navbar {
  background: linear-gradient(90deg, #1C8E9D 0%, #15707c 100%);
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-img {
  height: 50px;
  width: auto;
  border-radius: 5px;
}

.logo-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.link {
  text-decoration: none;
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  transition: opacity 0.3s;
}

.link:hover {
  opacity: 0.8;
}

.btn-entrar {
  background-color: #1b9dae;
  color: white;
  padding: 12px 35px;
  border-radius: 30px;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.btn-entrar:hover {
  background-color: #2da8b9;
  color: #f0fcfd;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.15);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
}

@media (max-width: 850px) {
  .menu-toggle {
    display: block;
  }

  .nav-links {
    position: absolute;
    top: 80px;
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    padding: 30px;
    box-shadow: 0 5px 10px rgba(0,0,0,0.1);
    display: none;
    gap: 20px;
  }

  .nav-links.ativo {
    display: flex;
  }

  .nav-links .link {
    color: #1C8E9D;
  }

  .btn-entrar {
    width: 100%;
    text-align: center;
    background-color: #1C8E9D;
    color: white;
  }
   .btn-entrar:hover {
    background-color: #15707c;
    color: white;
   }
}
</style>
