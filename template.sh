#!/bin/bash

# create main folders
mkdir -p public/css
mkdir -p public/js
mkdir -p server/models
mkdir -p server/routes
mkdir -p server/config

# create html files
touch public/index.html
touch public/add-medicine.html
touch public/sell-medicine.html
touch public/inventory.html

# create css
touch public/css/style.css

# create javascript files
touch public/js/addMedicine.js
touch public/js/sellMedicine.js
touch public/js/inventory.js

# server files
touch server/server.js

# models
touch server/models/Medicine.js
touch server/models/Sales.js

# routes
touch server/routes/medicineRoutes.js
touch server/routes/salesRoutes.js

# config
touch server/config/db.js

# project files
touch package.json
touch .env
touch README.md

echo "Successfully created the file structure for the pharmacy management system"