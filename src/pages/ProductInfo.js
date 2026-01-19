import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setUser } from "../redux/features/userSlice.js";
import { message } from "antd";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { gameAPI, orderAPI } from "../lib/api";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BoltIcon from "@mui/icons-material/Bolt";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import "./ProductInfo.css";
import "./Circle.css";
import "./ProductPage.css";
import IMAGES from "../img/image.js";
import website from "../website/data.js";

const ProductInfo = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const { user } = useSelector((state) => state.user);
  const { balance } = useAuth();
  const [product, setProduct] = useState(0);
  const [showImage, setShowImage] = useState(0);
  const [error, setError] = useState(false);
  //!NEW STATE
  const [amount, setAmount] = useState(null);
  const [packId, setPackId] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [playerCheck, setPlayerCheck] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // 'valid', 'invalid', 'checking', null
  const [loading, setLoading] = useState(false); // Payment loading state
  const [validationHistory, setValidationHistory] = useState([]);

  const [packCategory, setPackCategory] = useState(null);
  const [allCategory, setAllCategory] = useState(null);


  // Admin API removed - coupon functionality disabled
  // const getAllCoupons = async () => {
  //   try {
  //     const res = await axios.get("/api/admin/get-coupons");
  //     if (res.data.success) {
  //       setData(res.data.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  function setPriceAndId(selectedDescription) {
    // Find the pack by description (which is stored in amount field)
    const selectedPack = product?.cost?.find(
      (item) => item.amount === selectedDescription
    );

    if (selectedPack) {
      if (user?.reseller === "yes") {
        setSelectedPrice(selectedPack.resPrice);
        setFinalAmount(selectedPack.resPrice);
      } else {
        setSelectedPrice(selectedPack.price);
        setFinalAmount(selectedPack.price);
      }

      setProductId(selectedPack.id);
      setPackId(selectedPack.prodId);
    }
  }

  const getProduct = async () => {
    try {
      // Get game by ID from URL parameter
      const gameId = params._id;

      if (!gameId) {
        message.error("Game ID not provided");
        return;
      }

      // Get all games and find the one matching the ID
      const gamesResponse = await gameAPI.getAllGames();
      const gamesData = await gamesResponse.json();

      if (gamesData.success && gamesData.games) {
        // Find game by ID
        const game = gamesData.games.find(
          (g) => g._id === gameId || g.id === gameId
        );

        if (!game) {
          message.error("Game not found");
          return;
        }

        // Get diamond packs for this game
        try {
          const packsResponse = await gameAPI.getDiamondPacks(game._id);

          // Check if response is ok
          if (!packsResponse.ok) {
            const errorData = await packsResponse.json().catch(() => ({}));
            message.error(errorData.message || "Failed to load diamond packs. Please try again.");
            return;
          }

          const packsData = await packsResponse.json();

          // Handle the actual API response structure
          const packs = packsData.diamondPacks || packsData.packs || packsData.data || [];

          // Extract gameData from the response if available
          const gameData = packsData.gameData || null;

          if (packsData.success && packs.length > 0) {
            // Transform the data structure to match what the component expects
            const transformedProduct = {
              ...game,
              // Include gameData from the API response
              gameData: gameData || game.gameData || null,
              cost: packs.map((pack) => ({
                amount: pack.description || pack.amount, // Use description as the display amount
                price: pack.amount, // amount is the price in the API
                resPrice: pack.amount, // No reseller price in API, use same as price
                id: pack._id,
                prodId: pack._id,
                prodCategory: pack.category || "default",
                pimg: pack.logo, // Add logo for package image
                fakePrice: pack.amount, // For display purposes
                packData: pack.description, // Description for pack data
              })),
            };

            setProduct(transformedProduct);
            const defaultAmount = transformedProduct?.cost?.[0]?.amount;
            setAmount(defaultAmount);

            const defaultPackId = transformedProduct?.cost?.[0]?.prodId;
            setPackId(defaultPackId);

            const defaultId = transformedProduct?.cost?.[0]?.id;
            setProductId(defaultId);

            const defaultCategory = transformedProduct?.cost?.[0]?.prodCategory;
            setPackCategory(defaultCategory);

            const defaultPrice =
              user?.reseller === "yes"
                ? transformedProduct?.cost?.[0]?.resPrice
                : transformedProduct?.cost?.[0]?.price;
            setSelectedPrice(defaultPrice);
            setFinalAmount(defaultPrice);
          } else {
            // If no packs but success, show warning instead of error
            if (packsData.success !== false) {
              message.warning("No diamond packs available for this game");
            } else {
              message.error(packsData.message || "Failed to load diamond packs");
            }
          }
        } catch (packError) {
          console.error("Error loading diamond packs:", packError);
          message.error("Failed to load diamond packs. Please try again.");
        }
      } else {
        message.error(gamesData.message || "Failed to load games");
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to load product");
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const getValidationHistory = async (gameId) => {
    try {
      const response = await gameAPI.getValidationHistory(gameId);
      const res = await response.json();
      if (res.success) {
        setValidationHistory(res.validationHistory);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (product?._id || product?.id) {
      getValidationHistory(product._id || product.id);
    }
  }, [product]);

  // Order ID generation moved to checkout page

  // Get validation fields from gameData or fallback to old structure
  const getValidationFields = () => {
    // Check if gameData exists directly on product
    if (product?.gameData?.validationFields && Array.isArray(product.gameData.validationFields)) {
      return product.gameData.validationFields;
    }
    // Check if validationFields exists directly on product (in case gameData is spread)
    if (product?.validationFields && Array.isArray(product.validationFields)) {
      return product.validationFields;
    }
    // Fallback to old structure
    if (product?.fields === "1") return ["playerId"];
    if (product?.fields === "2") return ["playerId", "server"];
    if (product?.fields === "3") return ["playerId", "server"];
    return ["playerId"]; // Default
  };

  const validationFields = getValidationFields();
  // Check for playerId (case-insensitive and handle variations)
  const requiresPlayerId = validationFields.some(field =>
    field?.toLowerCase() === "playerid" ||
    field?.toLowerCase() === "player_id" ||
    field === "playerId"
  );
  // Check for server (case-insensitive and handle variations)
  const requiresServer = validationFields.some(field =>
    field?.toLowerCase() === "server" ||
    field?.toLowerCase() === "servers" ||
    field === "server"
  );

  // Check for regionList in gameData or directly on product
  const regionList = product?.gameData?.regionList || product?.regionList;
  const hasRegionList = regionList && Array.isArray(regionList) && regionList.length > 0;

  async function handleCheckPlayer() {
    if (requiresPlayerId && userId === "") {
      return message.error("Enter Player ID");
    }
    if (requiresServer && zoneId === "") {
      return message.error("Enter Server");
    }
    try {
      setCheckLoading(true);
      setValidationStatus('checking');
      const gameId = product?.gameData?._id || product?._id;
      const response = await gameAPI.validateUser(gameId, userId, zoneId || "");
      const res = await response.json();

      // Check if response was successful (HTTP 200-299)
      const isHttpSuccess = response.ok;

      // Check for new API response structure: response: true or valid: true or success: true
      const isValid = isHttpSuccess && (res.response === true || res.valid === true || res.success === true);

      if (isValid) {
        // Get nickname from data.nickname or name field
        const nickname = res.data?.nickname || res.name || "Validated";
        setPlayerCheck(nickname);
        setValidationStatus('valid');
        // Only show success message if there's a positive message, not an error message
        const successMsg = res.msg || res.message;
        if (successMsg && !successMsg.toLowerCase().includes('fail') && !successMsg.toLowerCase().includes('error') && !successMsg.toLowerCase().includes('invalid')) {
          message.success(successMsg);
        } else {
          message.success("User validated successfully");
        }
        setCheckLoading(false);
      } else {
        setValidationStatus('invalid');
        message.error(res.msg || res.message || "Failed to validate user");
        setCheckLoading(false);
      }
    } catch (error) {
      console.log(error);
      setValidationStatus('invalid');
      setCheckLoading(false);
      message.error("Failed to validate user");
    }
  }

  // Auto-validate user when required fields are filled
  useEffect(() => {
    if (product?.playerCheckBtn === "yes" && product?._id) {
      const hasRequiredFields = requiresPlayerId && requiresServer
        ? userId && zoneId
        : requiresPlayerId
          ? userId
          : false;

      if (hasRequiredFields) {
        const timeoutId = setTimeout(async () => {
          try {
            setCheckLoading(true);
            setValidationStatus('checking');
            const gameId = product?.gameData?._id || product?._id;
            const response = await gameAPI.validateUser(gameId, userId, zoneId || "");
            const res = await response.json();

            // Check if response was successful (HTTP 200-299)
            const isHttpSuccess = response.ok;

            // Check for new API response structure: response: true or valid: true or success: true
            const isValid = isHttpSuccess && (res.response === true || res.valid === true || res.success === true);

            if (isValid) {
              // Get nickname from data.nickname or name field
              const nickname = res.data?.nickname || res.name;
              setPlayerCheck(nickname);
              setValidationStatus('valid');
            } else {
              setValidationStatus('invalid');
              setPlayerCheck(null);
            }
            setCheckLoading(false);
          } catch (error) {
            setValidationStatus('invalid');
            setPlayerCheck(null);
            setCheckLoading(false);
          }
        }, 1000); // Debounce validation by 1 second

        return () => clearTimeout(timeoutId);
      } else {
        setValidationStatus(null);
        setPlayerCheck(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, zoneId, product?._id, product?.playerCheckBtn, requiresPlayerId, requiresServer]);

  // Payment handler functions
  const handleWalletPayment = async () => {
    if (!user) {
      message.warning("Please login to continue");
      navigate("/login");
      return;
    }

    // Check validation if required
    if (product?.playerCheckBtn === "yes" && validationStatus !== 'valid') {
      message.error("Please validate your user details before proceeding");
      return;
    }

    // Check balance
    if (parseFloat(balance) < parseFloat(selectedPrice)) {
      message.error("Insufficient balance for this order");
      return;
    }

    try {
      setLoading('wallet');

      const response = await orderAPI.createOrderWithWallet({
        diamondPackId: productId,
        playerId: userId,
        server: zoneId,
        quantity: 1,
      });

      const res = await response.json();

      if (res.success) {
        message.success(res.message || "Order placed successfully");

        // Get orderId from response
        const orderId = res.orderId;

        if (orderId) {
          // Navigate to order status page with orderId
          navigate(`/order-status?orderId=${orderId}`);
        } else {
          message.error("Order ID not found");
        }
      } else {
        message.error(res.message || "Failed to place order");
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      message.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!user) {
      message.warning("Please login to continue");
      navigate("/login");
      return;
    }

    // Check validation if required
    if (product?.playerCheckBtn === "yes" && validationStatus !== 'valid') {
      message.error("Please validate your user details before proceeding");
      return;
    }

    try {
      setLoading('upi');

      const response = await orderAPI.createOrderWithUPI({
        diamondPackId: productId,
        playerId: userId,
        server: zoneId,
        quantity: 1,
        redirectUrl: `${window.location.origin}/order-status`,
      });

      const res = await response.json();

      if (res.success) {
        // Check if we have a redirect_url (gateway response with success)
        if (res.redirect_url) {
          const url = new URL(res.redirect_url);
          const client_txn_id = url.searchParams.get('client_txn_id');

          if (client_txn_id) {
            // Redirect to order status page
            navigate(`/order-status?orderId=${client_txn_id}`);
            return;
          }
        }

        // Check if we have a payment URL to redirect to gateway
        if (res.transaction?.paymentUrl) {
          message.success("Redirecting to payment gateway...");
          setTimeout(() => {
            window.location.href = res.transaction.paymentUrl;
          }, 500);
          return;
        }

        // Check if we have status SCANNING or similar (mobagateway response)
        if (res.status === "SCANNING" || res.client_txn_id || res.udf1) {
          const orderId = res.client_txn_id || res.udf1;
          if (orderId) {
            navigate(`/order-status?orderId=${orderId}`);
            return;
          }
        }

        message.error("Payment response format not recognized");
      } else {
        message.error(res.message || "Failed to create UPI payment");
      }
    } catch (error) {
      console.error('UPI payment error:', error);
      message.error("Failed to create UPI payment");
    } finally {
      setLoading(false);
    }
  };

  // Removed getAllCategory - endpoint not available in new API
  // const getAllCategory = async () => {
  //   try {
  //     const res = await axios.get("/api/packcategory/get-pack-category", {
  //       headers: {
  //         Authorization: "Bearer " + localStorage.getItem("token"),
  //       },
  //     });
  //     if (res.data.success) {
  //       setAllCategory(res.data.data);
  //     } else {
  //       message.error(res.data.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   getAllCategory();
  // }, []);

  const uniqueCategories = Array.from(
    new Map(product?.cost?.map((item) => [item.prodCategory, item])).values()
  );

  // Function to get the most used image for each category (memoized for performance)
  const categoryImageMap = useMemo(() => {
    if (!product?.cost || product.cost.length === 0) return {};

    const imageMap = {};
    const categories = [...new Set(product.cost.map(item => item.prodCategory))];

    categories.forEach(category => {
      // Get all packages in this category
      const categoryPackages = product.cost.filter(item => item.prodCategory === category);

      // Count image occurrences
      const imageCount = {};
      categoryPackages.forEach(pkg => {
        if (pkg.pimg) {
          imageCount[pkg.pimg] = (imageCount[pkg.pimg] || 0) + 1;
        }
      });

      // Find the most used image
      let mostUsedImage = null;
      let maxCount = 0;
      Object.keys(imageCount).forEach(img => {
        if (imageCount[img] > maxCount) {
          maxCount = imageCount[img];
          mostUsedImage = img;
        }
      });

      // If no image found, use the first package's image
      if (!mostUsedImage && categoryPackages.length > 0) {
        mostUsedImage = categoryPackages[0].pimg;
      }

      imageMap[category] = mostUsedImage;
    });

    return imageMap;
  }, [product?.cost]);

  return (
    <Layout>
      <div className="productpage">
        <div className="pageheading">
          <span onClick={() => navigate("/")}>
            <ArrowBackIosIcon className="icon" />
            Go Back
          </span>
          <h5>{product?.name || "Product Details"}</h5>
        </div>
        {/* SECTION ONE P DETAILS */}
        {/* SECTION ONE P DETAILS */}
        {/* SECTION ONE P DETAILS */}
        <div className="section section1">
          <div className="image">
            <img
              src={
                product?.image?.startsWith('http://') || product?.image?.startsWith('https://')
                  ? product?.image
                  : `${website.link}/${product?.image}`
              }
              alt="image"
            />
          </div>
          <div className="game-title">
            <h2>{product?.name}</h2>
          </div>
        </div>
        {/* SECTION THREE PACKAGES*/}
        {/* SECTION THREE PACKAGES*/}
        {/* SECTION THREE PACKAGES*/}
        <div className="section section3">
          <h6>Select the package</h6>
          <div className="package-container">
            {packCategory && (
              <div className="pcategory">
                {uniqueCategories.map((item, index) => {
                  // Use the most used image for this category from categoryImageMap
                  const categoryImage = categoryImageMap[item?.prodCategory];
                  return (
                    <div key={index}>
                      <div
                        className={`pc ${packCategory === item?.prodCategory && "active"
                          }`}
                        onClick={() => setPackCategory(item?.prodCategory)}
                      >
                        {categoryImage && <img src={categoryImage} alt="" />}
                        <p>{item?.prodCategory}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className={`packages ${product?.cost?.length >= 4 && "height"}`}>
            <div className="package-container">
              {product?.cost
                ?.filter(
                  (item) =>
                    !packCategory || item?.prodCategory?.includes(packCategory)
                )
                ?.map((item, index) => {
                  // Use the most used image for this category, fallback to package image
                  const displayImage = categoryImageMap[item.prodCategory] || item?.pimg;
                  return (
                    <div
                      onClick={() => {
                        setAmount(item.amount);
                        setPriceAndId(item.amount);
                        // Scroll to EnterDetails section
                        setTimeout(() => {
                          const enterDetailsElement = document.getElementById('EnterDetails');
                          if (enterDetailsElement) {
                            enterDetailsElement.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }, 100);
                      }}
                      key={index}
                      className={`amount ${amount === item?.amount && "active"
                        }`}
                    >
                      <img src={displayImage} alt="" />
                      <span>
                        <small>{item.amount}</small>
                      </span>
                      <div className="price">
                        ₹
                        {user?.reseller === "yes"
                          ? item?.resPrice
                          : item?.price}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Validation Section - Above Proceed To Checkout */}
          {(requiresPlayerId || requiresServer || product?.playerCheckBtn === "yes") && (
            <div className="section section2" id="EnterDetails" style={{ marginTop: "20px" }}>
              <h6>Enter Details</h6>
              {requiresPlayerId && (
                <div className="field">
                  <label>Enter Your Player ID</label>
                  <input
                    className="player-tag"
                    type="text"
                    name="userId"
                    placeholder="Enter your Player ID"
                    onChange={(e) => setUserId(e.target.value)}
                    value={userId}
                  />
                </div>
              )}
              {requiresServer && (
                <div className="field">
                  <label>Select Server</label>
                  {hasRegionList ? (
                    <select
                      name="zoneId"
                      className="form-select player-tag"
                      onChange={(e) => setZoneId(e.target.value)}
                      value={zoneId}
                    >
                      <option value="">Select Server</option>
                      {regionList.map((region, index) => {
                        return (
                          <option key={index} value={region.code}>
                            {region.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      className="player-tag"
                      type="text"
                      name="zoneid"
                      placeholder="Enter your Server"
                      onChange={(e) => setZoneId(e.target.value)}
                      value={zoneId}
                    />
                  )}
                </div>
              )}
              {(product?.playerCheckBtn === "yes" || (requiresPlayerId || requiresServer)) && (
                <div className="validation-form">
                  {checkLoading && (
                    <div className="validation-status checking">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden"></span>
                      </div>
                      <span>Validating user...</span>
                    </div>
                  )}
                  {validationStatus === 'valid' && playerCheck && (
                    <div className="validation-status valid">
                      <span className="validation-icon">✓</span>
                      <span>Username: {playerCheck}</span>
                    </div>
                  )}
                  {validationStatus === 'invalid' && !checkLoading && (
                    <div className="validation-status invalid">
                      <span className="validation-icon">✗</span>
                      <span>User validation failed. Please check your details.</span>
                    </div>
                  )}
                  <button
                    className="validate-btn"
                    onClick={handleCheckPlayer}
                    disabled={!userId || (requiresServer && !zoneId) || checkLoading}
                  >
                    <span>Validate</span>
                    <span className="validate-icon">✓</span>
                  </button>
                </div>
              )}
              {/* Validation History */}
              {validationHistory?.length > 0 && (
                <div className="validation-history mt-3">
                  <h6 style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Recent Validations</h6>
                  <div className="history-list d-flex flex-wrap gap-2">
                    {validationHistory.map((item) => (
                      <div
                        key={item._id}
                        className="history-item"
                        style={{
                          background: "rgba(1, 255, 253, 0.1)",
                          border: "1px solid rgba(1, 255, 253, 0.2)",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#fff"
                        }}
                        onClick={() => {
                          setUserId(item.playerId);
                          if (item.server) setZoneId(item.server);
                          if (item.playerName) setPlayerCheck(item.playerName);
                          // Optional: Auto validate or just fill
                        }}
                      >
                        <span className="player-id fw-bold">{item.playerId}</span>
                        {item.server && <span className="server ms-1">({item.server})</span>}
                        {item.playerName && <span className="player-name ms-1 text-info">- {item.playerName}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Options */}
          {amount && selectedPrice && (
            <div className="payment-section mt-4">
              <h6>Select Payment Method</h6>
              {product?.playerCheckBtn === "yes" && validationStatus !== 'valid' && (
                <div className="validation-required-notice mb-3" style={{ color: '#ffa500', fontSize: '14px', textAlign: 'center' }}>
                  Please validate your user details before selecting a payment method.
                </div>
              )}

              <div className={`payment-options ${product?.playerCheckBtn === "yes" && validationStatus !== 'valid' ? 'disabled' : ''}`}>
                {/* Wallet Payment */}
                <div className="payment-method wallet-payment">
                  <div className="payment-info">
                    <img width="30px" src={IMAGES.wallet} alt="Wallet" />
                    <div>
                      <p className="payment-title">EZ WALLET</p>
                      <p className="balance-info">BALANCE: ₹{user ? parseFloat(balance || 0).toFixed(2) : 0}</p>
                    </div>
                  </div>
                  <button
                    className="payment-btn wallet-btn"
                    onClick={handleWalletPayment}
                    disabled={!user || (product?.playerCheckBtn === "yes" && validationStatus !== 'valid') || loading}
                  >
                    {loading === 'wallet' ? "Processing..." : `Pay ₹${selectedPrice}`}
                  </button>
                </div>

                {/* UPI Payment */}
                <div className="payment-method upi-payment">
                  <div className="payment-info">
                    <img width="40px" src={IMAGES.upi} alt="UPI" />
                    <div className="upi-apps">
                      <img width="40px" src={IMAGES.gpay} alt="GPay" />
                      <img width="40px" src={IMAGES.phonepe} alt="PhonePe" />
                      <img width="40px" src={IMAGES.paytm} alt="Paytm" />
                    </div>
                  </div>
                  <button
                    className="payment-btn upi-btn"
                    onClick={handleUpiPayment}
                    disabled={!user || (product?.playerCheckBtn === "yes" && validationStatus !== 'valid') || loading}
                  >
                    {loading === 'upi' ? "Processing..." : `Pay ₹${selectedPrice}`}
                  </button>
                </div>
              </div>

              {!user && (
                <div className="login-prompt mt-3 text-center">
                  <button className="login-btn" onClick={() => navigate("/login")}>
                    Login to Purchase
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductInfo;
