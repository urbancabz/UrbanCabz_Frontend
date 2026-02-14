import { useRef, useState } from 'react';

export default function useDragScroll() {
    const ref = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e) => {
        // Supporting both left click (0) and right click (2)
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
    };

    const onContextMenu = (e) => {
        // Prevent context menu to allow right-click dragging
        if (isDragging) e.preventDefault();
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        // Slight delay to allow the last frame of movement
        setTimeout(() => setIsDragging(false), 50);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast factor
        ref.current.scrollLeft = scrollLeft - walk;
    };

    return {
        ref,
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
        onContextMenu,
        isDragging
    };
}
