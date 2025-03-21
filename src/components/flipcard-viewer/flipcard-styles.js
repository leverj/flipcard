import { css } from "lit";

export const styles = css`
  /* Default CSS reset for <img> to prevent browser styles from interfering */
  img {
    max-width: unset !important;
  }

  /* Main card container with perspective for 3D effect */
  .iaw-card {
    perspective: 10000px;
    -webkit-perspective: 10000px;
    scale: 0.95;
  }

  /* Card inner container with transition effects */
  .iaw-card-inner {
    transition: transform 1.5s;
    transform-style: preserve-3d;
    width: var(--container-width);
    height: var(--container-height);
    transform: rotateY(var(--rotate-by));
  }

  /* Common styles for front and back face of card */
  .iaw-card-front,
  .iaw-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* Back face is rotated 180 degrees to show reverse side */
  .iaw-card-back {
    transform: rotateY(180deg);
  }

  /* Common styles for images on both front and back */
  .iaw-front,
  .iaw-back {
    position: relative;
    object-fit: contain;
    object-position: center;
    height: var(--img-height);
    width: var(--img-width);
  }

  /* Positioning for front image on back card face */
  .iaw-card .iaw-card-inner .iaw-card-back .iaw-front {
    position: relative;
    top: var(--front-img-top);
    left: var(--front-img-left);
  }

  /* Positioning for back image on back card face */
  .iaw-card .iaw-card-inner .iaw-card-back .iaw-back {
    position: relative;
    top: var(--back-img-top);
    left: var(--back-img-left);
  }
`; 