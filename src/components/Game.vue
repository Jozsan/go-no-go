<template>
  <div class="container">
    <div class="game-container">
      <transition name="zoom-in" mode="out-in">
        <h2 v-if="gameState === 'INITIALIZING'" :key="timerValue" class="timer">
          {{ timerValue }}
        </h2>
      </transition>
      <h2 v-if="gameState === 'INITIAL'">Pressez entrée pour lancer le test</h2>
      <h2 v-if="gameState === 'GO'">GO</h2>
      <h2 v-if="gameState === 'NO_GO'">NO GO</h2>
      <h2 v-if="gameState === 'RUNNING'">RUNNING</h2>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import path from 'path';
import fs from 'fs';

const { remote } = window.require('electron');

const configPath = process.env.NODE_ENV === 'development'
  ? path.join(remote.app.getAppPath(), '../config')
  : path.join(process.resourcesPath, 'config');

export default Vue.extend({
  name: 'Game',
  data() {
    return {
      gameState: 'INITIAL',
      timerValue: 4,
      tickTimeout: 0,
      startTimeMS: 0,
      gameConfig: {},
      goCountLeft: 0,
      noGoCountLeft: 0,
      noGoSequence: 0,
    };
  },
  created() {
    console.log('ComponentCreated');
    window.addEventListener('keyup', this.handleKeyUp);
    this.gameConfig = JSON.parse(fs.readFileSync(path.join(configPath, 'game.config.json'), 'utf8'));
  },
  computed: {
    inputDelay(): number {
      console.log('START MS', this.startTimeMS);
      return new Date().getTime() - this.$data.startTimeMS;
    },

  },
  methods: {

    handleKeyUp(event: KeyboardEvent) {
      const { code } = event;
      switch (code) {
        case 'Enter':
          this.launchGame();
          break;
        case 'Backspace':
          this.resetGame();
          console.log('ResetGame');
          break;
        case 'Space':
          this.handlePlayerInput();
          break;
        default:
          console.log(event);
          console.log('Unsuported Input');
          break;
      }
    },

    async launchGame() {
      console.log('LaunchingGame');
      this.gameState = 'INITIALIZING';
      this.goCountLeft = this.gameConfig.GO_COUNT;
      this.noGoCountLeft = this.gameConfig.NO_GO_COUNT;
      this.noGoSequence = 0;
      this.timerValue = 3;
      await this.sleep(1.5);
      this.timerValue = 2;
      await this.sleep(1.5);
      this.timerValue = 1;
      await this.sleep(1.5);
      return this.gameTick();
    },

    resetGame() {
      this.gameState = 'INITIAL';
    },

    handlePlayerInput() {
      console.log('oui');
      console.log('Input in', this.inputDelay);
      clearTimeout(this.tickTimeout);
      if (this.gameState === 'GO' || this.gameState === 'NO_GO') this.gameTick();
    },

    async gameTick() {
      this.gameState = 'RUNNING';
      await this.sleep(1.5);

      this.startTimeMS = new Date().getTime();
      const isGo = this.isGo();
      if (this.goCountLeft === 0 && this.noGoCountLeft === 0) {
        console.log('GAME TERMINATED');
        return;
      }
      if (isGo) {
        this.gameState = 'GO';
        this.goCountLeft -= 1;
      } else {
        this.gameState = 'NO_GO';
        this.noGoCountLeft -= 1;
      }
      console.log('ON SET TIMEOUT');
      this.tickTimeout = window.setTimeout(this.handleTickTimeout, 5000);
    },

    handleTickTimeout() {
      console.log('NO USER INPUT');
      this.gameTick();
    },

    isGo(): boolean {
      if (this.noGoSequence >= this.gameConfig.MAX_NO_GO_SEQUENCE) return true;
      if (this.goCountLeft === 0 && this.noGoCountLeft > 0) return false;
      if (this.noGoCountLeft === 0 && this.goCountLeft > 0) return true;
      return Math.floor(Math.random() * Math.floor(2)) === 0;
    },

    sleep(seconds: number) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), seconds * 1000);
      });
    },
  },

});
</script>
<style scoped>
  .container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  h2 {
    margin: 0;
  }
  .timer {
    font-size: 8em;
  }
  .zoom-in-enter {
    font-size: 1em;
  }

  .zoom-in-enter-active {
    transition: all 1s linear;
  }
</style>
