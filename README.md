# Siebel-D3 ABS Calendar 

Siebel Open-UI implementation of the d3js Calendar for Appointment Booking System.

* https://d3js.org/

# Implementation

To implement the Physical Wraper the following will need to done.

* Load the Physical Wraper "gmD3ABSResultPR.js" to the "..\PUBLIC\scripts\Siebel\custom" folder.
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
