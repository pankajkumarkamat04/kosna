import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { otherAPI } from "../lib/api";
import { message, Modal, Skeleton } from "antd";
import "./News.css";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNews = async (pageNum) => {
    try {
      setLoading(true);
      const response = await otherAPI.getNews(pageNum, 20);
      const res = await response.json();

      if (res.success || res.message === "Public news retrieved successfully") {
        const newNews = res.data?.news || [];
        const pagination = res.data?.pagination || {};

        if (pageNum === 1) {
          setNewsList(newNews);
        } else {
          setNewsList(prev => [...prev, ...newNews]);
        }

        setHasMore(pagination.currentPage < pagination.totalPages);
      } else {
        message.error("Failed to load news");
      }
    } catch (error) {
      console.error(error);
      message.error("Error loading news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const openNews = (newsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <Layout>
      <div className="news-page-container">
        <div className="container">
          <div className="news-header">
            <h1 className="news-title">Latest <span className="highlight-text">News</span> & Updates</h1>
            <p className="news-subtitle">Stay updated with the latest announcements and changes.</p>
          </div>

          <div className="news-grid">
            {newsList.map((item, index) => {
              // Ensure image URL is complete
              const imageUrl = item.image || "https://placehold.co/600x400/0d1b34/01fffd?text=News";

              return (
                <div key={item._id || index} className="news-card" onClick={() => openNews(item)}>
                  <div className="news-image-wrapper">
                    <img src={imageUrl} alt={item.title} className="news-thumbnail" />
                    <div className="news-category-badge">{item.category || "General"}</div>
                  </div>
                  <div className="news-content">
                    <div className="news-meta">
                      <AccessTimeIcon style={{ fontSize: '14px', marginRight: '5px' }} />
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <h3 className="news-card-title">{item.title}</h3>
                    <p className="news-card-summary">{item.summary}</p>
                    <div className="read-more-btn">
                      Read More <ArrowForwardIcon style={{ fontSize: '16px' }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <>
                {[1, 2, 3].map(i => (
                  <div key={`skel-${i}`} className="news-card skeleton-card">
                    <Skeleton.Image active={true} className="w-100" style={{ height: '180px' }} />
                    <div className="p-3">
                      <Skeleton active={true} paragraph={{ rows: 2 }} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {hasMore && !loading && newsList.length > 0 && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={handleLoadMore}>
                Load More News
              </button>
            </div>
          )}

          {!loading && newsList.length === 0 && (
            <div className="no-news">
              <h3>No news available at the moment.</h3>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={null}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        className="news-modal"
        width={800}
      >
        {selectedNews && (
          <div className="news-detail-content">
            <div className="news-detail-header">
              <span className="news-detail-date">
                <AccessTimeIcon style={{ fontSize: '14px', marginRight: '5px' }} />
                {new Date(selectedNews.createdAt).toLocaleDateString()}
              </span>
              <span className="news-detail-category">{selectedNews.category}</span>
            </div>
            <h2 className="news-detail-title">{selectedNews.title}</h2>
            {selectedNews.image && (
              <img src={selectedNews.image} alt={selectedNews.title} className="news-detail-image" />
            )}
            <div
              className="news-detail-body"
              dangerouslySetInnerHTML={{ __html: selectedNews.content }}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default News;
