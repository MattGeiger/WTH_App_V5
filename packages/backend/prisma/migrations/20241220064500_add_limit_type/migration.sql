-- Add limitType field to FoodItem
ALTER TABLE FoodItem ADD COLUMN limitType TEXT DEFAULT 'perHousehold';
