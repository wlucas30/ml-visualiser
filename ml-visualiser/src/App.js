import React, { useState, useEffect } from 'react';
import './App.css';

function DataEntryGraph({ data, setData }) {
	// State variables for storing the parameters of the linear regression model
	const [m, setM] = useState(0);
	const [c, setC] = useState(0);
	const [learningRate, setLearningRate] = useState(0.01);
	const [epochs, setEpochs] = useState(10);
	const [paramHistory, setParamHistory] = useState([]);

	// Functions for updating stored data values
	function handleXChange(e, index) {
		const newData = [...data];
		newData[index].x = Number(e.target.value);
		setData(newData);
	}
	
	function handleYChange(e, index) {
		const newData = [...data];
		newData[index].y = Number(e.target.value);
		setData(newData);
	}

	// Function for resetting the linear regression model parameters
	function resetParameters() {
		setM(0);
		setC(0);
	}

	// Function for calculating MSE
	function calculateMeanSquaredError() {
		// Initialise the squared error sum as 0
		let sum_squared_error = 0;
		
		// Iterate through each data point
		data.forEach((point, index) => {
			// Calculate squared error
			let squared_error = (point.y - predict(point.x, m, c)) ** 2

			// Add to the sum
			sum_squared_error += squared_error;
		});

		// Divide the sum to find the mean squared error
		let mean_squared_error = sum_squared_error / (2 * data.length);

		return mean_squared_error;
	}

	// Function for performing gradient descent (learning) 
	function gradientDescent() {
		// Initialise empty list of parameter changes
		let tempParamHistory = [];

		// Iterate for as many times as the user decides
		let newM = m;
		let newC = c;
		for (let i = 0; i < epochs; i++) {
			// Initialise empty variable for storing the sum of all errors
			let errors_sum = 0;
	
			data.forEach((point, index) => {
				// Calculate prediction
				let prediction = predict(point.x, newM, newC);
					
				// Add the error to the errors sum
				errors_sum += (prediction - point.y)
			});
	
			// Initialise empty variable for storing the sum of all errors multiplied by x
			let errors_sum_x = 0;
	
			data.forEach((point, index) => {
				// Calculate prediction
				let prediction = predict(point.x, newM, newC);
					
				// Add the error to the errors sum
				errors_sum_x += (prediction - point.y) * point.x
			});
	
			// Change the parameters in the direction of reduced error
			newC = newC - learningRate * (1/data.length) * errors_sum;
			newM = newM - learningRate * (1/data.length) * errors_sum_x;

			// Add the new parameters to the parameter history	
			tempParamHistory.push({m: newM, c: newC});
		}

		// Show the parameter changes on the graph
		setParamHistory(tempParamHistory);
	}

	// Function for predicting a value given the x value
	function predict(x, tempM, tempC) {
		return (tempM * x) + tempC
	}

	// Function for slowly showing changes to the regression parameters
	useEffect(() => {
		let index = 0;
		const intervalId = setInterval(() => {
			if (index < paramHistory.length) {
				console.log("Updating!");
				setM(paramHistory[index].m);
				setC(paramHistory[index].c);
				index++;
			} else {
				clearInterval(intervalId);
			}
		}, 1000 / paramHistory.length); // Divide 5000ms by the length of paramHistory to spread the updates over 5 seconds
	}, [paramHistory]);

	// Overlay a square background on the graph
	return (
		<div>
			<div className="values-graph">
				<svg width="500" height="500">
					<rect width="500" height="500" fill="#eeeeee" />

					{/* Grid lines behind graph */}
					{[...Array(10)].map((_, i) => (
						<React.Fragment key={i}>
							<line x1={0} y1={50 * i} x2={500} y2={50 * i} stroke="#bbbbbb" />
							<line x1={50 * i} y1={0} x2={50 * i} y2={500} stroke="#bbbbbb" />
						</React.Fragment>
					))}
					
					{/* Axis lines */}
					<line x1="0" y1="250" x2="500" y2="250" stroke="black" />
					<line x1="250" y1="0" x2="250" y2="500" stroke="black" />
					
					{/* Plotting data points */}
					{data.map((point, index) => (
						<circle key={index} cx={250 + point.x} cy={250 - point.y} r="3" fill="red" />
					))}		

					{/* Plotting regression line */}
					<line x1="0" y1={250 - (-250)*m - c} x2="500" y2={250 - (m * 250 + c)} stroke="blue" />
				</svg>
			</div>	
			<table className="values-table" style={{borderCollapse: 'collapse'}}>
				<thead>
					<tr>
						<th style={{border: '1px solid black'}}>Index</th>
						<th style={{border: '1px solid black'}}>x</th>
						<th style={{border: '1px solid black'}}>y</th>
						<th style={{border: '1px solid black'}} />
					</tr>
				</thead>
				<tbody>
					{data.map((point, index) => (
						<tr key={index}>
							<td style={{border: '1px solid black'}}>{index}</td>
							<td style={{border: '1px solid black'}}>
								<input type="number" value={point.x} onChange={(e) => handleXChange(e, index)} />
							</td>
							<td style={{border: '1px solid black'}}>
								<input type="number" value={point.y} onChange={(e) => handleYChange(e, index)} />
							</td>
							<td style={{border: '1px solid black'}}>
								<button onClick={() => setData(data.filter((_, i) => i !== index))}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
				{/* Add new data point */}
				<tfoot>
					<tr>
						<td style={{border: '1px solid black'}} colSpan="4">
							<button onClick={() => setData([...data, {x: 0, y: 0}])}>Add Data Point</button>
						</td>
					</tr>
				</tfoot>
			</table>

			{/* Learning controls */}
			<div>
				<label for="learning-rate" style={{marginRight: 10}}>Learning rate:</label>
				<input type="number" name="learning-rate" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} style={{marginRight: 10}} /><br />
				<label for="epochs" style={{marginRight: 10}}>Epochs:</label>
				<input type="number" name="epochs" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} style={{marginRight: 10}} /><br /><br />
				<button onClick={gradientDescent} style={{marginRight: 10, fontSize: 15}}>Begin learning</button>
				<button onClick={resetParameters} style={{marginRight: 10, fontSize: 15}}>Reset parameters</button>
			</div>

			{/* Display current linear regression model parameters */}
			<div>
				<h2>Linear regression parameters</h2>
				<p>y = {m}x + {c}</p>
			</div>
		</div>
	);
}

export default function App() {
	// Create a state variable for storing the user-inputted data
  	const [data, setData] = useState([{x:200, y:35}, {x:100, y:17.5}, {x:50, y:8.75}]);

  	return (
    	<div>
      		<h1>Machine Learning Visualiser</h1>
     	 	<p>This web app allows for the visualisation of univariate linear regression</p>
			<DataEntryGraph data={data} setData={setData} />
   		</div>
  	);
};