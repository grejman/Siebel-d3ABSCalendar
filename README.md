# Siebel-D3 ABS Calendar 

Siebel Open-UI implementation of the d3js Calendar for Appointment Booking System.

* https://d3js.org/

# Siebel Vertion

  IP2014
  IP2015
  IP2016

# Implementation

To implement the Physical Renderer the following will need to be done:

* Load the Physical Renderer "gmD3ABSResultPR.js" to the "..\PUBLIC\scripts\Siebel\custom" folder.
* Load the Style Sheet "gmD3ABSResult.css to the "..\PUBLIC\files\custom" folder.
* Load the d3js folder and files to the "..\PUBLIC\scripts\Siebel\custom" folder.
  * Note: for the latest version of d3js please refer to https://d3js.org/ Site.
* On your Applet create a control  with the name "gmD3BulletChart".
* Add the Physical Renderer to the Applet under Manifest Administration.
  * The Applet this PR was design for is "Abs Result Pick Applet"
* Add the Style Sheet to the Application under Manifest Administration.

# Contributions

Contributions are welcome.

# Example

![Example](/images/sample.png)
