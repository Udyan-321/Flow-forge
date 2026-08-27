import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np


data = pd.DataFrame({
    "Area_sq_ft": [800, 1000, 1200, 1500, 1800, 2000, 2200, 2500],
    "Price_lakh": [32, 40, 48, 60, 72, 80, 88, 100]
})

print("Dataset:")
print(data)


plt.scatter(data["Area_sq_ft"], data["Price_lakh"])
plt.xlabel("Area (sq. ft)")
plt.ylabel("Price (lakh)")
plt.title("Area vs Price")
plt.show()


X = data[["Area_sq_ft"]]
y = data["Price_lakh"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


model = LinearRegression()
model.fit(X_train, y_train)


slope = model.coef_[0]
intercept = model.intercept_

print("\nSlope:", slope)
print("Intercept:", intercept)


print(f"Regression Equation: Price = {slope:.4f} × Area + {intercept:.4f}")


area_1750 = pd.DataFrame({
    "Area_sq_ft": [1750]
})

predicted_price = model.predict(area_1750)

print("\nPredicted price for 1750 sq. ft:",
      round(predicted_price[0], 2), "lakh")


y_pred = model.predict(X_test)



mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\nModel Evaluation:")
print("MAE :", mae)
print("MSE :", mse)
print("RMSE:", rmse)
print("R² Score:", r2)


plt.scatter(
    data["Area_sq_ft"],
    data["Price_lakh"],
    label="Actual Data"
)

plt.plot(
    data["Area_sq_ft"],
    model.predict(data[["Area_sq_ft"]]),
    label="Regression Line"
)

plt.xlabel("Area (sq. ft)")
plt.ylabel("Price (lakh)")
plt.title("Linear Regression: Area vs Price")
plt.legend()
plt.show()