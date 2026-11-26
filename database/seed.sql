-- ====================================================================
-- SUPER MASHALA & DRY FRUITS - SEED DATA
-- Default Categories, Products, Variants, Inventory and Admin Profile
-- ====================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
('cat_masala_powder', 'Masala Powder', 'masala-powder', 'Authentic stone-ground pure spice powders with rich aroma and natural oils preserved.', '/assets/categories/masala-powder.jpg', 1, true),
('cat_whole_spices', 'Whole Spices', 'whole-spices', 'Select-grade sun-dried whole spices sourced directly for maximum freshness.', '/assets/categories/whole-spices.jpg', 2, true),
('cat_blended_masala', 'Blended Masala', 'blended-masala', 'Traditional family secret spice blends formulated for authentic flavor.', '/assets/categories/blended-masala.jpg', 3, true),
('cat_dry_fruits', 'Dry Fruits', 'dry-fruits', 'Handpicked California almonds, crunchy cashews, Afghan raisins and pistachios.', '/assets/categories/dry-fruits.jpg', 4, true),
('cat_special_products', 'Special Products', 'special-products', 'Specialty culinary spices, saffron, nutmeg and exclusive pantry selections.', '/assets/categories/special-products.jpg', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Products
INSERT INTO products (id, category_id, name, slug, short_description, long_description, ingredients, storage_instructions, image_url, is_featured, is_bestseller, is_active) VALUES
('sm_turmeric', 'cat_masala_powder', 'Pure Salem Turmeric Powder', 'salem-turmeric-powder', 'High curcumin Salem turmeric powder with vibrant golden hue and rich earthy fragrance.', 'Our Salem Turmeric Powder is milled from premium sun-cured turmeric fingers. It contains high curcumin content, offering an authentic deep yellow hue and strong antimicrobial richness.', '100% Pure Salem Turmeric Rhizomes', 'Store in a cool, dry place inside an airtight container away from direct sunlight.', '/assets/products/masala/turmeric-powder.jpg', true, true, true),
('sm_red_chilli', 'cat_masala_powder', 'Kashmiri & Byadgi Red Chilli Powder', 'kashmiri-red-chilli-powder', 'Signature blend offering deep natural ruby red color and balanced medium spice heat.', 'Crafted with premium stemless Byadgi and Kashmiri chillies. Delivers an appetizing bright crimson color to curries and gravies without harsh pungent heat.', 'Stemless Dried Kashmiri & Byadgi Red Chillies', 'Keep sealed in a cool, dark and moisture-free environment.', '/assets/products/masala/red-chilli-powder.jpg', true, true, true),
('sm_coriander', 'cat_masala_powder', 'Roasted Coriander Powder (Dhana)', 'roasted-coriander-powder', 'Freshly slow-roasted fragrant coriander seeds ground to fine aromatic powder.', 'Made from bold green coriander seeds from Rajasthan. Slow-roasted over moderate heat to activate essential oils and release a mild sweet citrus note.', '100% Roasted Coriander Seeds', 'Store in an airtight jar in a cool pantry.', '/assets/products/masala/coriander-powder.jpg', true, false, true),
('sm_garam_masala', 'cat_blended_masala', 'Royal Shahi Garam Masala Blend', 'royal-shahi-garam-masala', 'Exquisite 14-spice royal blend providing unforgettable aroma and deep rich warmth.', 'Handcrafted according to vintage home recipes. Combines green cardamom, black cardamom, cloves, cinnamon, mace, nutmeg, cumin, black pepper and bay leaves in precise harmony.', 'Cardamom, Cinnamon, Cloves, Mace, Nutmeg, Cumin, Black Pepper, Star Anise, Bay Leaf', 'Store sealed in a dry container. Do not expose to steam while cooking.', '/assets/products/masala/garam-masala.jpg', true, true, true),
('sm_kitchen_king', 'cat_blended_masala', 'Special Kitchen King Masala', 'kitchen-king-masala', 'All-in-one versatile curry powder that elevates vegetable curries, paneer and gravies.', 'The ultimate kitchen companion for restaurants and daily cooking. Balanced spices infused with hing, dry mango and fenugreek for restaurant-style depth.', 'Coriander, Cumin, Turmeric, Black Pepper, Dry Mango, Fenugreek, Cardamom, Asafoetida', 'Store in a cool, moisture-tight container.', '/assets/products/masala/kitchen-king.jpg', false, true, true),
('sm_black_pepper', 'cat_whole_spices', 'Malabar Black Pepper (Tellicherry)', 'malabar-black-pepper', 'Bold Tellicherry black peppercorns bursting with pungent piperine aroma.', 'Hand-sorted Malabar whole black peppercorns. Rich in essential piperine, clean-washed and sun-dried for the characteristic sharp bite and aroma.', '100% Premium Malabar Whole Peppercorns', 'Store whole in a cool and dry container.', '/assets/products/whole-spices/black-pepper.jpg', true, false, true),
('sm_green_cardamom', 'cat_whole_spices', 'Bold Green Cardamom (Elaichi 8mm+)', 'bold-green-cardamom', 'Jumbo 8mm+ emerald green cardamom pods packed with sweet camphor aroma.', 'Sourced directly from the Idukki hills of Kerala. Large pods packed full of glistening dark seeds with heavenly floral-mint fragrance.', '100% Bold Green Cardamom Pods', 'Keep sealed away from moisture to retain delicate aromas.', '/assets/products/whole-spices/green-cardamom.jpg', true, true, true),
('sm_cloves', 'cat_whole_spices', 'Handpicked Ceylon Cloves (Laung)', 'handpicked-ceylon-cloves', 'Plump whole cloves with round crowns and high essential eugenol oil content.', 'Naturally dried aromatic cloves with intact flower heads. Highly aromatic and ideal for biryanis, gravies and traditional medicines.', '100% Ceylon Whole Cloves', 'Store in an airtight jar.', '/assets/products/whole-spices/cloves.jpg', false, false, true),
('sm_cinnamon', 'cat_whole_spices', 'True Ceylon Cinnamon Sticks (Dalchini)', 'true-ceylon-cinnamon', 'Fragile sweet multi-layered Ceylon cinnamon quills low in coumarin.', 'Genuine Sri Lankan quills, sweet, delicate and fragrant, distinct from harsh cassia bark. Perfect for both savory curries and desserts.', '100% True Ceylon Cinnamon Quills', 'Store in an airtight spice container.', '/assets/products/whole-spices/cinnamon.jpg', false, false, true),
('sm_almonds', 'cat_dry_fruits', 'California Almonds (Badam Giri)', 'california-almonds', 'Crunchy, naturally sweet nonpareil California almonds rich in vitamin E and protein.', 'Carefully graded large size almond kernels with tender skin and clean buttery crunch. Essential staple for retail grocery counters.', '100% Raw California Almond Kernels', 'Store in airtight containers in a cool and dry spot or refrigerated.', '/assets/products/dry-fruits/almonds.jpg', true, true, true),
('sm_cashews', 'cat_dry_fruits', 'Goa Whole Cashews (Kaju W240)', 'goa-whole-cashews-w240', 'Creamy, buttery whole white W-240 jumbo cashew nuts with rich sweet taste.', 'Jumbo sized whole cashew nuts graded W-240. Crisp, naturally sweet and undamaged, ideal for sweets, gravies and snacking.', '100% Premium W-240 Cashew Nuts', 'Keep in airtight refrigeration or cool airtight container.', '/assets/products/dry-fruits/cashews.jpg', true, true, true),
('sm_raisins', 'cat_dry_fruits', 'Kishmish Golden Afghan Raisins', 'kishmish-golden-raisins', 'Juicy long golden raisins naturally sweet, seedless and sun-cured.', 'Tender, chewy and amber-golden raisins with high natural fructose. Sourced from choice seedless green grapes.', '100% Golden Afghan Raisins', 'Keep tightly closed in refrigeration or cool dry environment.', '/assets/products/dry-fruits/raisins.jpg', true, false, true),
('sm_pistachios', 'cat_dry_fruits', 'Roasted & Salted California Pistachios', 'california-pistachios', 'Naturally opened crunchy pistachios with light sea-salt roasting.', 'Plump California pistachios with shells open naturally on the tree. Lightly roasted and salted for addictive crunch and vibrant green kernel.', 'Pistachios in Shell, Sea Salt', 'Store in an airtight container to preserve crispness.', '/assets/products/dry-fruits/pistachios.jpg', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Product Variants (100g, 250g, 500g, 1kg) with Fixed Wholesale Pricing
INSERT INTO product_variants (id, product_id, packet_weight, weight_in_grams, fixed_wholesale_price, sku, is_available) VALUES
-- Turmeric Powder
('v_turmeric_100g', 'sm_turmeric', '100g', 100, 26.00, 'SM-TUR-100', true),
('v_turmeric_250g', 'sm_turmeric', '250g', 250, 60.00, 'SM-TUR-250', true),
('v_turmeric_500g', 'sm_turmeric', '500g', 500, 115.00, 'SM-TUR-500', true),
('v_turmeric_1kg', 'sm_turmeric', '1kg', 1000, 220.00, 'SM-TUR-1000', true),

-- Red Chilli Powder
('v_chilli_100g', 'sm_red_chilli', '100g', 100, 36.00, 'SM-CHI-100', true),
('v_chilli_250g', 'sm_red_chilli', '250g', 250, 85.00, 'SM-CHI-250', true),
('v_chilli_500g', 'sm_red_chilli', '500g', 500, 165.00, 'SM-CHI-500', true),
('v_chilli_1kg', 'sm_red_chilli', '1kg', 1000, 320.00, 'SM-CHI-1000', true),

-- Coriander Powder
('v_coriander_100g', 'sm_coriander', '100g', 100, 22.00, 'SM-COR-100', true),
('v_coriander_250g', 'sm_coriander', '250g', 250, 50.00, 'SM-COR-250', true),
('v_coriander_500g', 'sm_coriander', '500g', 500, 95.00, 'SM-COR-500', true),
('v_coriander_1kg', 'sm_coriander', '1kg', 1000, 180.00, 'SM-COR-1000', true),

-- Shahi Garam Masala
('v_garam_100g', 'sm_garam_masala', '100g', 100, 75.00, 'SM-GAR-100', true),
('v_garam_250g', 'sm_garam_masala', '250g', 250, 180.00, 'SM-GAR-250', true),
('v_garam_500g', 'sm_garam_masala', '500g', 500, 350.00, 'SM-GAR-500', true),
('v_garam_1kg', 'sm_garam_masala', '1kg', 1000, 680.00, 'SM-GAR-1000', true),

-- Kitchen King
('v_kitchen_100g', 'sm_kitchen_king', '100g', 100, 48.00, 'SM-KIT-100', true),
('v_kitchen_250g', 'sm_kitchen_king', '250g', 250, 115.00, 'SM-KIT-250', true),
('v_kitchen_500g', 'sm_kitchen_king', '500g', 500, 220.00, 'SM-KIT-500', true),

-- Black Pepper
('v_pepper_100g', 'sm_black_pepper', '100g', 100, 90.00, 'SM-PEP-100', true),
('v_pepper_250g', 'sm_black_pepper', '250g', 250, 220.00, 'SM-PEP-250', true),
('v_pepper_500g', 'sm_black_pepper', '500g', 500, 430.00, 'SM-PEP-500', true),
('v_pepper_1kg', 'sm_black_pepper', '1kg', 1000, 850.00, 'SM-PEP-1000', true),

-- Green Cardamom
('v_cardamom_100g', 'sm_green_cardamom', '100g', 100, 280.00, 'SM-CAR-100', true),
('v_cardamom_250g', 'sm_green_cardamom', '250g', 250, 680.00, 'SM-CAR-250', true),
('v_cardamom_500g', 'sm_green_cardamom', '500g', 500, 1320.00, 'SM-CAR-500', true),

-- Ceylon Cloves
('v_cloves_100g', 'sm_cloves', '100g', 100, 110.00, 'SM-CLO-100', true),
('v_cloves_250g', 'sm_cloves', '250g', 250, 260.00, 'SM-CLO-250', true),
('v_cloves_500g', 'sm_cloves', '500g', 500, 510.00, 'SM-CLO-500', true),

-- Cinnamon Quills
('v_cinnamon_100g', 'sm_cinnamon', '100g', 100, 55.00, 'SM-CIN-100', true),
('v_cinnamon_250g', 'sm_cinnamon', '250g', 250, 130.00, 'SM-CIN-250', true),
('v_cinnamon_500g', 'sm_cinnamon', '500g', 500, 250.00, 'SM-CIN-500', true),

-- California Almonds
('v_almonds_250g', 'sm_almonds', '250g', 250, 210.00, 'SM-ALM-250', true),
('v_almonds_500g', 'sm_almonds', '500g', 500, 410.00, 'SM-ALM-500', true),
('v_almonds_1kg', 'sm_almonds', '1kg', 1000, 790.00, 'SM-ALM-1000', true),

-- Goa Cashews
('v_cashews_250g', 'sm_cashews', '250g', 250, 230.00, 'SM-CAS-250', true),
('v_cashews_500g', 'sm_cashews', '500g', 500, 450.00, 'SM-CAS-500', true),
('v_cashews_1kg', 'sm_cashews', '1kg', 1000, 880.00, 'SM-CAS-1000', true),

-- Raisins
('v_raisins_250g', 'sm_raisins', '250g', 250, 85.00, 'SM-RAI-250', true),
('v_raisins_500g', 'sm_raisins', '500g', 500, 160.00, 'SM-RAI-500', true),
('v_raisins_1kg', 'sm_raisins', '1kg', 1000, 300.00, 'SM-RAI-1000', true),

-- Pistachios
('v_pista_250g', 'sm_pistachios', '250g', 250, 290.00, 'SM-PIS-250', true),
('v_pista_500g', 'sm_pistachios', '500g', 500, 560.00, 'SM-PIS-500', true),
('v_pista_1kg', 'sm_pistachios', '1kg', 1000, 1090.00, 'SM-PIS-1000', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Inventory Stock
INSERT INTO inventory (variant_id, stock_quantity, low_stock_threshold) VALUES
('v_turmeric_100g', 120, 20),
('v_turmeric_250g', 85, 15),
('v_turmeric_500g', 60, 10),
('v_turmeric_1kg', 45, 10),
('v_chilli_100g', 150, 20),
('v_chilli_250g', 90, 15),
('v_chilli_500g', 70, 10),
('v_chilli_1kg', 40, 10),
('v_coriander_100g', 80, 15),
('v_coriander_250g', 60, 10),
('v_coriander_500g', 50, 10),
('v_coriander_1kg', 30, 10),
('v_garam_100g', 100, 15),
('v_garam_250g', 75, 10),
('v_garam_500g', 45, 10),
('v_garam_1kg', 25, 5),
('v_kitchen_100g', 60, 10),
('v_kitchen_250g', 40, 10),
('v_kitchen_500g', 35, 8),
('v_pepper_100g', 50, 10),
('v_pepper_250g', 35, 8),
('v_pepper_500g', 25, 5),
('v_pepper_1kg', 15, 4),
('v_cardamom_100g', 40, 8),
('v_cardamom_250g', 25, 5),
('v_cardamom_500g', 15, 3),
('v_cloves_100g', 45, 10),
('v_cloves_250g', 30, 6),
('v_cloves_500g', 20, 5),
('v_cinnamon_100g', 55, 10),
('v_cinnamon_250g', 40, 8),
('v_cinnamon_500g', 25, 5),
('v_almonds_250g', 90, 15),
('v_almonds_500g', 70, 12),
('v_almonds_1kg', 50, 10),
('v_cashews_250g', 80, 15),
('v_cashews_500g', 60, 10),
('v_cashews_1kg', 40, 8),
('v_raisins_250g', 110, 20),
('v_raisins_500g', 80, 15),
('v_raisins_1kg', 60, 10),
('v_pista_250g', 65, 10),
('v_pista_500g', 45, 8),
('v_pista_1kg', 30, 5)
ON CONFLICT (variant_id) DO NOTHING;
