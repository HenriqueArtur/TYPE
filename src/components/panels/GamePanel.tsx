import { Application, Assets, Sprite } from "pixi.js";
import { useEffect, useRef } from "react";

export default function GamePanel() {
  const pixiContainer = useRef<HTMLDivElement | null>(null);
  const pixiAppRef = useRef<Application | undefined>(undefined);

  useEffect(() => {
    if (!pixiContainer.current) return;

    const app = new Application();
    let bunny: Sprite | null = null;

    app
      .init({
        background: "#222244",
        resizeTo: document.getElementById("GAME") as HTMLElement,
      })
      .then(async () => {
        pixiAppRef.current = app;
        if (pixiContainer.current) {
          pixiContainer.current.innerHTML = "";
          pixiContainer.current.appendChild(app.canvas);
        }

        // Load the bunny image
        const texture = await Assets.load("https://pixijs.com/assets/bunny.png");
        bunny = new Sprite(texture);
        bunny.anchor.set(0.5);
        bunny.x = app.screen.width / 2;
        bunny.y = app.screen.height / 2;
        app.stage.addChild(bunny);

        // Mouse move handler
        function onMouseMove(event: MouseEvent) {
          if (!bunny) return;
          // Get mouse position relative to the canvas
          const rect = app.canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          bunny.x = mouseX;
          bunny.y = mouseY;
        }

        app.canvas.addEventListener("mousemove", onMouseMove);
      });

    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy(true);
        if (
          pixiContainer.current &&
          pixiAppRef.current.canvas.parentNode === pixiContainer.current
        ) {
          pixiContainer.current.removeChild(pixiAppRef.current.canvas);
        }
      }
    };
  }, []);

  return <div ref={pixiContainer} />;
}
