import React from 'react';
import { Clock, Image } from 'lucide-react';
import styles from '../../styles/components/TrendCard.module.css';

const TrendCard = React.memo(function TrendCard({ trend, index = 0 }) {
    const isHigh = trend.alignmentPercentage >= 90;

    return (
        <article className={styles.card} id={`trend-card-${index}`}>
            {/* Image Placeholder */}
            <div className={styles.imageWrapper}>
                {trend.imageUrl ? (
                    <img
                        src={trend.imageUrl}
                        alt={trend.name}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <Image size={28} />
                    </div>
                )}
            </div>

            <span className={styles.badge}>{trend.badge}</span>
            <h3 className={styles.title}>{trend.name}</h3>

            {trend.category && (
                <span className={styles.categoryTag}>{trend.category}</span>
            )}

            <div className={styles.alignmentContainer}>
                <div className={styles.alignmentBar}>
                    <div
                        className={`${styles.alignmentFill} ${isHigh ? styles.alignmentFillHigh : ''}`}
                        style={{ width: `${trend.alignmentPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={trend.alignmentPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
                <div className={styles.alignmentLabel}>
                    <span className={styles.alignmentText}>Brand Alignment</span>
                    <span className={styles.alignmentPercent}>{trend.alignmentPercentage}%</span>
                </div>
            </div>

            {trend.timing && (
                <div className={styles.timing}>
                    <Clock size={14} />
                    <span>{trend.timing}</span>
                </div>
            )}
        </article>
    );
});

export default TrendCard;
