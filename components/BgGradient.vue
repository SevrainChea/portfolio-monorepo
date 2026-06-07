<template>
  <div
    class="from-primary-bg1 to-primary-bg3 via-primary-bg2 gradient-bg absolute top-0 left-0 h-screen w-screen overflow-hidden bg-gradient-to-t"
  >
    <!-- Container -->
    <div class="gradient-container h-full w-full">
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div class="circle g1"></div>
      <div class="circle g2"></div>
      <div class="circle g3"></div>
      <div class="circle g4"></div>
      <div class="circle g5"></div>
      <div class="interactive"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  const interBubble = document.querySelector<HTMLDivElement>(".interactive")!;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) return;

  let curX = 0;
  let curY = 0;
  let tgX = 0;
  let tgY = 0;

  function move() {
    curX += (tgX - curX) / 20;
    curY += (tgY - curY) / 20;
    interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    requestAnimationFrame(() => {
      move();
    });
  }

  window.addEventListener("mousemove", (event) => {
    tgX = event.clientX;
    tgY = event.clientY;
  });

  move();
});
</script>

<style scoped>
@keyframes moveInCircle {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes moveVertical {
  0% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(50%);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes moveHorizontal {
  0% {
    transform: translateX(-50%) translateY(-10%);
  }
  50% {
    transform: translateX(50%) translateY(10%);
  }
  100% {
    transform: translateX(-50%) translateY(-10%);
  }
}

.gradient-bg {
  .gradient-container {
    filter: url(#goo) blur(15px);
  }
  svg {
    display: none;
  }

  .circle {
    position: absolute;
    mix-blend-mode: var(--blending);

    width: var(--circle-size);
    height: var(--circle-size);
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);

    opacity: 0.6;
  }

  .g1 {
    background: radial-gradient(
        circle at center,
        rgba(var(--color-circle1), 0.8) 0,
        rgba(var(--color-circle1), 0) 50%
      )
      no-repeat;

    transform-origin: center center;
    animation: moveVertical 30s ease infinite;
  }

  .g2 {
    background: radial-gradient(
        circle at center,
        rgba(var(--color-circle2), 0.8) 0,
        rgba(var(--color-circle2), 0) 50%
      )
      no-repeat;

    transform-origin: calc(50% - 400px);
    animation: moveInCircle 20s reverse infinite;
  }

  .g3 {
    background: radial-gradient(
        circle at center,
        rgba(var(--color-circle3), 0.8) 0,
        rgba(var(--color-circle3), 0) 50%
      )
      no-repeat;

    transform-origin: calc(50% + 400px);
    animation: moveInCircle 40s linear infinite;
  }

  .g4 {
    background: radial-gradient(
        circle at center,
        rgba(var(--color-circle4), 0.8) 0,
        rgba(var(--color-circle4), 0) 50%
      )
      no-repeat;

    transform-origin: calc(50% - 200px);
    animation: moveHorizontal 40s ease infinite;
  }

  .g5 {
    background: radial-gradient(
        circle at center,
        rgba(var(--color-circle5), 0.8) 0,
        rgba(var(--color-circle5), 0) 50%
      )
      no-repeat;

    transform-origin: calc(50% - 800px) calc(50% + 200px);
    animation: moveInCircle 20s ease infinite;
  }

  .interactive {
    position: absolute;
    background: radial-gradient(
        circle at center,
        rgba(var(--color-interactive), 0.8) 0,
        rgba(var(--color-interactive), 0) 50%
      )
      no-repeat;
    mix-blend-mode: var(--blending);

    width: 100%;
    height: 100%;
    top: -50%;
    left: -50%;

    opacity: 0.7;
  }

  @media (prefers-reduced-motion: reduce) {
    .circle,
    .interactive {
      animation: none;
    }
  }
}
</style>
