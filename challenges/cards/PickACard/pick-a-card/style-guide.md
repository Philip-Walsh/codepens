# 3D Card Style Guide

## CSS Best Practices

### Container (Deck) Rules
```css
/* Always set perspective on container */
#deck {
  perspective: 1000px;
  transform-style: preserve-3d;
  position: relative;
}
```

### Card Rules
```css
.card {
  /* Maintain card proportions */
  aspect-ratio: 2.5 / 3.5;  /* Standard playing card ratio */
  width: 100px;  /* Base size */
  
  /* Preserve 3D space */
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transform-origin: center center;
  
  /* Smooth transitions */
  transition: transform 0.5s ease;
  
  /* Maintain shape */
  border-radius: 10px;
  position: absolute;
}
```

### 3D Transform Guidelines
- Use small increments for stacking (0.5px - 1px)
- Keep rotation angles subtle (< 1deg)
- Layer cards with negative Z-index
- Maintain card proportions when scaling

## JavaScript Best Practices

### Card Positioning
```javascript
// Calculate 3D position
function position3DCard(index) {
  return `
    translateX(${index * 0.5}px) 
    translateY(${index * 0.5}px) 
    translateZ(${-index}px) 
    rotateX(${index * 0.2}deg)
  `;
}

// Apply transform
card.style.transform = position3DCard(index);
```

### Performance Tips
- Use transform instead of position properties
- Batch DOM updates
- Use requestAnimationFrame for animations
- Cache transform calculations
- Avoid changing perspective during animations

### Debugging
- Use browser dev tools 3D view
- Check for z-fighting (overlapping cards)
- Verify transform-style inheritance
- Monitor performance with Timeline
