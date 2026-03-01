import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../styles/components/CardCarousel.module.css';

/**
 * Reusable 3D Card Carousel with depth transitions.
 *
 * @param {Object[]} items - Data array to render
 * @param {Function} renderCard - (item, index, isActive) => JSX
 * @param {number} autoAdvanceMs - Auto-advance interval (0 = disabled)
 * @param {string} title - Optional section title
 */
export default function CardCarousel({
    items = [],
    renderCard,
    autoAdvanceMs = 4000,
    title,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const total = items.length;

    const goTo = useCallback((idx) => {
        setActiveIndex(((idx % total) + total) % total);
    }, [total]);

    const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
    const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

    // Auto-advance
    useEffect(() => {
        if (autoAdvanceMs <= 0 || isPaused || total <= 1) return;
        intervalRef.current = setInterval(next, autoAdvanceMs);
        return () => clearInterval(intervalRef.current);
    }, [autoAdvanceMs, isPaused, next, total]);

    if (total === 0) return null;

    // Show up to 5 cards for depth effect
    const getCardStyle = (i) => {
        let offset = i - activeIndex;
        // Wrap around
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const absOffset = Math.abs(offset);
        const isVisible = absOffset <= 2;

        return {
            transform: `
                translateX(${offset * 220}px)
                translateZ(${-absOffset * 80}px)
                scale(${1 - absOffset * 0.12})
                rotateY(${offset * -8}deg)
            `,
            opacity: isVisible ? 1 - absOffset * 0.3 : 0,
            zIndex: 10 - absOffset,
            pointerEvents: offset === 0 ? 'auto' : 'none',
            filter: absOffset > 0 ? `brightness(${1 - absOffset * 0.15})` : 'none',
        };
    };

    return (
        <div
            className={styles.container}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {title && <h2 className={styles.title}>{title}</h2>}

            <div className={styles.viewport}>
                {/* Prev Button */}
                <button
                    className={`${styles.navBtn} ${styles.navPrev}`}
                    onClick={prev}
                    aria-label="Previous"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* 3D Stage */}
                <div className={styles.stage}>
                    {items.map((item, i) => (
                        <div
                            key={item.id || i}
                            className={`${styles.card} ${i === activeIndex ? styles.cardActive : ''}`}
                            style={getCardStyle(i)}
                        >
                            {renderCard(item, i, i === activeIndex)}
                        </div>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className={`${styles.navBtn} ${styles.navNext}`}
                    onClick={next}
                    aria-label="Next"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Dots */}
            <div className={styles.dots}>
                {items.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
