-- Insert a new record to the account table
INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Modify the Tony Stark record to change the account_type to "Admin"
UPDATE account
SET account_type = 'Admin'
WHERE first_name = 'Tony' AND last_name = 'Stark';

--Delete the Tony Stark record from the database.
DELETE FROM account
WHERE account_id = 1;

--Modify the "GM Hummer"
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE inv_id = 10;

-- Task 5: Use an inner join to select make, model, and classification name for "Sport" category
SELECT inventory.make, inventory.model, classification.classification_name
FROM inventory
INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

-- Task 6: Update all records in the inventory table to modify inv_image and inv_thumbnail paths
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
