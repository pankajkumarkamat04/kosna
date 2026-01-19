import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameAPI } from "../lib/api";
import SearchIcon from "@mui/icons-material/Search";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import website from "../website/data";
import "./Products.css";

const Products = ({ title, homeLabel }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState(null);

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getAllGames();
      const res = await response.json();
      if (res.success) {
        setProducts(res.games || res.data);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <div className="products-container">
      <h2>
        Games
        <SportsEsportsIcon className="icon" />
      </h2>
      <div className="hrline"></div>
      <div className="products">
        {products &&
          products.map((product, index) => {
            return (
              <div
                onClick={() => navigate(`/product/${product?._id || product?.id || ''}`)}
                key={index}
                className="product text-start"
              >
                <div className={`productimage loading ${loading && "active"}`}>
                  <img src={product?.image || `${website.link}/${product?.image}`} alt={product?.name} />
                </div>
                <div className="productdetails">
                  <div className="name">{product?.name}</div>
                  <div className="company">{product?.publisher || product?.company}</div>
                  {product?.cost && product?.cost[0] && (
                    <div className="price">
                      <div className="fakeprice">
                        ₹{product?.cost[0]?.fakePrice}
                      </div>
                      <div className="realprice">₹{product?.cost[0]?.price}</div>
                      {product?.savetag && (
                        <div className="sale">
                          <LocalOfferIcon className="icon" />
                          {product?.savetag}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Products;
