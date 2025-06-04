import { DragEvent } from "react";

export const getIndicators = (e: DragEvent, id: string) => {
  const targetGrid: HTMLElement | null = e.currentTarget as HTMLElement;
  return Array.from(targetGrid.querySelectorAll(id) as NodeListOf<HTMLElement>);
};

export const getNearestIndicator = (
  e: DragEvent,
  indicators: HTMLElement[],
) => {
  // You might need to adjust this value based on the average size/spacing of your list items.
  // It's less about an "offset" for activation and more about defining a search radius.
  // However, for pure distance calculation, you might not even need a fixed offset.
  // Let's remove DISTANCE_OFFSET from the calculation of closeness and focus on true Euclidean distance.

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const el = indicators.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();

      // Calculate the center of the indicator for distance calculation
      const indicatorCenterX = box.left + box.width / 2;
      const indicatorCenterY = box.top + box.height / 2;

      // Calculate Euclidean distance (distance formula: sqrt((x2-x1)^2 + (y2-y1)^2))
      const distance = Math.sqrt(
        Math.pow(mouseX - indicatorCenterX, 2) +
          Math.pow(mouseY - indicatorCenterY, 2),
      );

      // If the current indicator is closer than the previously closest one
      if (distance < closest.distance) {
        return { distance: distance, element: child };
      } else {
        return closest;
      }
    },
    {
      // Initialize with a very large distance
      distance: Number.POSITIVE_INFINITY,
      // Default to the first indicator or null if no indicators
      element: indicators.length > 0 ? indicators[0] : null,
    },
  );

  return el;
};

export const clearIndicators = (el: HTMLElement | null, id: string) => {
  if (el) {
    const indicators = Array.from(
      el.querySelectorAll(
        id, // Target all indicators in the grid
      ) as NodeListOf<HTMLElement>,
    );
    indicators.forEach((i) => {
      i.style.opacity = "0"; // Hide all indicators
    });
  }
};

export const highlightIndicator = (e: DragEvent, id: string) => {
  const indicators = getIndicators(e, id);
  clearIndicators(e.currentTarget as HTMLElement, id); // Clear highlights in the current grid

  const { element } = getNearestIndicator(e, indicators);
  if (!element) {
    console.error("hightlightIndicator failed: nearestIndicator not found");
    return;
  }
  element.style.opacity = "1"; // Show the nearest indicator
};
