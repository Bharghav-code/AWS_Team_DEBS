import React from 'react';
import { Users, TrendingUp, User } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import styles from '../../styles/components/InfluencerCard.module.css';

const InfluencerCard = React.memo(function InfluencerCard({ influencer, isWithinBudget = true, index = 0 }) {
    return (
        <article className={styles.card} id={`influencer-card-${index}`}>
            {/* Image / Avatar */}
            <div className={styles.imageWrapper}>
                {influencer.imageUrl ? (
                    <img
                        src={influencer.imageUrl}
                        alt={influencer.name || influencer.handle}
                        className={styles.image}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <User size={32} />
                    </div>
                )}
            </div>

            {/* Name & Handle */}
            {influencer.name && (
                <h3 className={styles.name}>{influencer.name}</h3>
            )}
            <p className={styles.handle}>{influencer.handle}</p>

            {/* Category badge */}
            {influencer.category && (
                <span className={styles.categoryBadge}>{influencer.category}</span>
            )}

            {/* Budget tag */}
            <span className={`${styles.budgetTag} ${isWithinBudget ? styles.withinBudget : styles.overBudget}`}>
                {formatCurrency(influencer.cost)}
            </span>

            {/* Metrics */}
            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <Users size={14} />
                    <span className={styles.metricValue}>{formatNumber(influencer.followers)}</span>
                    followers
                </div>
                <div className={styles.metric}>
                    <TrendingUp size={14} />
                    <span className={styles.metricValue}>
                        {formatPercentage(influencer.engagementRate ?? influencer.engagement)}
                    </span>
                    engagement
                </div>
            </div>

            {influencer.niche && (
                <span className={styles.niche}>{influencer.niche}</span>
            )}
        </article>
    );
});

export default InfluencerCard;
