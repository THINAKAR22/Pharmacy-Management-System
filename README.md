# Pharmacy Management System

A comprehensive Pharmacy Management System built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- **Medicine Inventory Management**
  - Add new medicines with details (name, category, manufacturer, price, quantity, expiry date)
  - View all medicines in inventory
  - Edit medicine details
  - Delete medicines
  - Search and filter medicines
  - Stock status tracking (low stock, critical stock, out of stock)

- **Sales Management**
  - Sell medicines to customers
  - Real-time stock updates
  - Shopping cart functionality
  - Multiple payment methods (Cash, Card, UPI, Insurance)
  - Customer details tracking
  - Automatic inventory reduction on sale

- **Dashboard**
  - Overview of total medicines, low stock items, today's sales, and total revenue
  - Recent sales activity
  - Quick action buttons for common tasks

- **Inventory Analytics**
  - Total items count
  - Total inventory value
  - Low stock items counter
  - Expiring soon medicines tracker

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pharmacy-management