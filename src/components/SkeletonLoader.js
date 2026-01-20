import React from 'react';
import './Skeleton.css';

export const GameCardSkeleton = () => {
    return (
        <div className="product text-start" style={{ pointerEvents: 'none' }}>
            <div className="productimage skeleton" style={{ height: '80px' }}></div>
            <div className="productdetails">
                <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '50%', height: '14px' }}></div>
            </div>
        </div>
    );
};

export const ProductInfoSkeleton = () => {
    return (
        <div className="productpage">
            {/* Page Heading Skeleton */}
            <div className="pageheading mb-4">
                <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
                <div className="skeleton skeleton-title" style={{ width: '200px', margin: '0 0 0 auto' }}></div>
            </div>

            {/* Section 1: Image and Title */}
            <div className="section section1">
                <div className="image skeleton" style={{ height: '150px', width: '100%' }}></div>
                <div className="game-title mt-3">
                    <div className="skeleton skeleton-title" style={{ width: '60%', margin: '0 auto', height: '40px' }}></div>
                </div>
            </div>

            {/* Section 3: Packages */}
            <div className="section section3 mt-4">
                <div className="skeleton skeleton-text" style={{ width: '150px', marginBottom: '20px' }}></div>

                {/* Categories */}
                <div className="package-container mb-4">
                    <div className="pcategory d-flex gap-3 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0 }}></div>
                        ))}
                    </div>
                </div>

                {/* Packages Grid */}
                <div className="package-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '15px' }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HomeBannerSkeleton = () => {
    return (
        <div className="banner">
            <div className="image skeleton" style={{ width: '100%', height: '120px', borderRadius: '15px' }}></div>
        </div>
    );
};
