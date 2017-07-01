if (typeof(SiebelAppFacade.gmD3ABSResultPR) === "undefined") {
  SiebelJS.Namespace("SiebelAppFacade.gmD3ABSResultPR");
  define("siebel/custom/gmD3ABSResultPR", ["siebel/custom/d3js/d3.v3.min","siebel/phyrenderer"], function () {
    SiebelAppFacade.gmD3ABSResultPR = (function () {

      var gUtils     = SiebelJS.Dependency("SiebelApp.Utils");
      var gConstants = SiebelJS.Dependency("SiebelApp.Constants");
      var gEvHelper  = SiebelApp.S_App.PluginBuilder.GetHoByName("EventHelper");
      var gD3Margins = {top: 20, right: 15, bottom: 25, left: 60};

      function gmD3ABSResultPR(pm) {
        var gD3SVG    = null;
        var gGlobals  = {
              D3Width:       0,
              D3Height:      0,
              D3TimeScaleY0: null,
              D3TimeScaleX0: null
            } 

        this.GetD3SVG = function()     { return gD3SVG;   };
        this.SetD3SVG = function(aObj) { gD3SVG = aObj;   };
        this.GetGlobals = function()   { return gGlobals; };

        SiebelAppFacade.gmD3ABSResultPR.superclass.constructor.apply(this, arguments);
      }

      SiebelJS.Extend(gmD3ABSResultPR, SiebelAppFacade.PhysicalRenderer);

      gmD3ABSResultPR.prototype.Init = function () {
        SiebelAppFacade.gmD3ABSResultPR.superclass.Init.apply(this, arguments);
      }

      gmD3ABSResultPR.prototype.ShowUI = function () {
        SiebelAppFacade.gmD3ABSResultPR.superclass.ShowUI.apply(this, arguments);

        var pm            = this.GetPM();
        var lGlobals      = this.GetGlobals();
        var lD3SVG        = null;
        var lPlaceHolder  = pm.Get("GetPlaceholder");
        var lParentWidth  = $("#" + lPlaceHolder).parent().outerWidth();
        var lParentHeight = $("#" + lPlaceHolder).parent().outerHeight();

        lParentHeight     = lParentHeight===0?600:lParentHeight;
        lGlobals.D3Width  = lParentWidth  - gD3Margins.left - gD3Margins.right;
        lGlobals.D3Height = lParentHeight - gD3Margins.top  - gD3Margins.bottom;

        $("#" + lPlaceHolder).replaceWith("<div id='" + lPlaceHolder + "' class='gm-svg-container' style='width:100%;padding-bottom:0;overflow:scroll;'></div>");
        $("#" + lPlaceHolder).css('height',lParentHeight+50);

        lD3SVG = d3.select("#" + lPlaceHolder)
                   .append('svg:svg')
                   .attr('width',   lGlobals.D3Width  + gD3Margins.left + gD3Margins.right)
                   .attr('height',  lGlobals.D3Height + gD3Margins.top  + gD3Margins.bottom)
                   .attr('class',   'gm_svg');
        this.SetD3SVG(lD3SVG);

        $("div[name=popup]").width(900);
      }

      gmD3ABSResultPR.prototype.BindData = function (bRefresh) {
        SiebelAppFacade.gmD3ABSResultPR.superclass.BindData.apply(this, arguments);

        var pm            = this.GetPM();
        var lGlobals      = this.GetGlobals();
        var lD3SVG        = this.GetD3SVG();
        var that          = this;
        var lQueryMode    = pm.Get("IsInQueryMode");
      //var lListCtrl     = pm.Get("ListOfColumns");
      //var lControls     = pm.Get("GetControls");
        var lRecordRawSet = pm.Get("GetRawRecordSet");
        var lRecordSet    = pm.Get("GetRecordSet");
        var lPlaceHolder  = pm.Get("GetPlaceholder");
        var lData         = { items: [] };
        var lItems        = null;
        var lD3Rects      = null;
        var lDTStart      = null;
        var lDTEnd        = null;
        var lDTNow        = new Date
        var lDTNow7       = d3.time.day.offset(lDTNow,7);
        var lD3SiebelDate = d3.time.format('%d/%m/%Y %H:%M:%S');
        var lDefTimeStart = getTime(new Date(lDTNow.setHours(6 ,0,0)));
        var lDefTimeEnd   = getTime(new Date(lDTNow.setHours(18,0,0)));

        if(bRefresh) {
          lD3SVG.selectAll("g").remove();
        }
        if(lQueryMode) { return; }

        // Load Record Items
        for(var i=0,l=lRecordSet.length;i<l;i++){

          lDTStart = lD3SiebelDate.parse(lRecordRawSet[i]["Planned Start"]);
          lTStart  = lDTStart.getTime();
          if (lRecordRawSet[i]["Planned End"] !== "") {
            lDTEnd = lD3SiebelDate.parse(lRecordRawSet[i]["Planned End"]);
          } else {
            lDTEnd = new Date();
          }

          lData.items.push({
            id:     i,
            row_id: lRecordRawSet[i]["Id"],
            start:  lDTStart,
            end:    lDTEnd,
            desc:   lRecordSet[i]["Name"]
          });
        }

        // find overlapping itmes and set lane.
        for (i=0;i<lData.items.length;i++) {
          lItems = lData.items.filter(function(x) { 
            return((x.start < lData.items[i].end) && (x.end > lData.items[i].start))
          });
          lData.items[i].lane  = 1;
          lData.items[i].lanes = lItems.length;
          for (var j=0;j<lItems.length;j++) {
            lData.items[lItems[j].id].lane = j+1;
          }
          lItems = null;
        }
  
        // Calculate the number of Days.
        var a = d3.min(lData.items, function(d) { return d3.time.day.offset(d.start,-1)});
        var b = d3.max(lData.items, function(d) { return d3.time.day.offset(d.end,1)>lDTNow7?d3.time.day.offset(d.end,1):lDTNow7; });
        lGlobals.D3Width  = 150 * ((b.getTime() / (1000*60*60*24)) - (a.getTime() / (1000*60*60*24)));

        // Set the width based on the unumber of Days.
        lD3SVG = d3.select("#" + lPlaceHolder).select("svg")
                    .attr('width',   lGlobals.D3Width  + gD3Margins.left + gD3Margins.right);

        lD3SVG.append('g')
          .attr('transform', 'translate(' + gD3Margins.left + ',' + gD3Margins.top + ')')
          .attr('width',  lGlobals.D3Width)
          .attr('height', lGlobals.D3Height)
          .attr('class',  'gm_svg_main');

        // Init Y Time Scale (Time)
        lGlobals.D3TimeScaleY0 = d3.time.scale()
          .domain([d3.min(lData.items, function(d) { return getTime(d.start) < lDefTimeStart?getTime(d.start):lDefTimeStart; }), d3.max(lData.items, function(d) { return getTime(d.end)>lDefTimeEnd?getTime(d.end):lDefTimeEnd; })])
          .range ([0, lGlobals.D3Height]);

        lGlobals.D3YTimeAxis = d3.svg.axis()
          .scale(lGlobals.D3TimeScaleY0)
          .orient('left')
          .ticks(d3.time.hours, 1)
          .tickFormat(d3.time.format('%I %p'))
          .tickSize(8, 0, 0);

        lD3SVG.select('.gm_svg_main').append('g')
          .attr('transform', 'translate(0,0.5)')
          .attr('class', 'gm_svg_main gm_svg_axis')
          .call(lGlobals.D3YTimeAxis)
          .selectAll('text')
            .attr('dx', 0)
            .attr('dy', 4);

        // Init X Time Scale (Days)
        lGlobals.D3TimeScaleX0 = d3.time.scale()
          .domain([d3.min(lData.items, function(d) { return d3.time.day.offset(d.start,-1)}), d3.max(lData.items, function(d) { return d3.time.day.offset(d.end,1); })])
          .range ([0, lGlobals.D3Width]);

        lGlobals.D3XTimeAxis = d3.svg.axis()
          .scale(lGlobals.D3TimeScaleX0)
          .orient('top')
          .ticks(d3.time.days, 1)
          .tickFormat(d3.time.format('%a, %b %e'))
          .tickSize(15, 0, 0)

        lD3SVG.select('.gm_svg_main').append('g')
          .attr('transform', 'translate(0,0.5)')
          .attr('class', 'gm_svg_main gm_svg_axis')
          .call(lGlobals.D3XTimeAxis)
          .selectAll('text')
            .attr('dx', 65)
            .attr('dy', 12);

        // draw virtical lanes for the days
        var dateArray = d3.time.scale()
                .domain([d3.min(lData.items, function(d) { return d3.time.day.offset(d.start,-1)}), d3.max(lData.items, function(d) { return d3.time.day.offset(d.end,1); })])
                .ticks(d3.time.days, 1)
        lD3SVG.select('.gm_svg_main').append('g')
          .attr('transform', 'translate(0,0.5)')
          .selectAll('line')
          .data(dateArray)
            .enter().append('line')
              .attr('x1',     function(d) { return lGlobals.D3TimeScaleX0 (d3.time.day(d));})
              .attr('y1',     0)
              .attr('x2',     function(d) { return lGlobals.D3TimeScaleX0 (d3.time.day(d));})
              .attr('y2',     lGlobals.D3Height)
              .attr('stroke', 'lightgray');

        // draw virtical lines for the days
        var dateArray = d3.time.scale()
                .domain([d3.min(lData.items, function(d) { return d3.time.day.offset(d.start,-1)}), d3.max(lData.items, function(d) { return d3.time.day.offset(d.end,1); })])
                .ticks(d3.time.days, 1)
        lD3SVG.select('.gm_svg_main').append('g')
          .attr('transform', 'translate(0,0.5)')
          .selectAll('line')
          .data(dateArray)
            .enter().append('line')
              .attr('x1',     function(d) { return lGlobals.D3TimeScaleX0 (d3.time.day(d));})
              .attr('y1',     0)
              .attr('x2',     function(d) { return lGlobals.D3TimeScaleX0 (d3.time.day(d));})
              .attr('y2',     lGlobals.D3Height)
              .attr('stroke', 'lightgray');
              
        // draw horisontal lines for the days
        var dateArray = d3.time.scale()
                .domain([d3.min(lData.items, function(d) { return getTime(d.start) < lDefTimeStart?getTime(d.start):lDefTimeStart; }), d3.max(lData.items, function(d) { return getTime(d.end)>lDefTimeEnd?getTime(d.end):lDefTimeEnd; })])
                .ticks(d3.time.hours, 2)
        lD3SVG.select('.gm_svg_main').append('g')
          .attr('transform', 'translate(0,0.5)')
          .selectAll('line')
          .data(dateArray)
            .enter().append('line')
              .attr('x1',     0)
              .attr('y1',     function(d) { return lGlobals.D3TimeScaleY0 (d3.time.hour(d));})
              .attr('x2',     lGlobals.D3Width)
              .attr('y2',     function(d) { return lGlobals.D3TimeScaleY0 (d3.time.hour(d));})
              .attr('stroke', 'lightgray');
              
        // load item rects
        lGlobals.D3Items = lD3SVG.select('.gm_svg_main').append('g').attr('clip-path', 'url(#clip)');

        lD3Rects = lGlobals.D3Items.selectAll('rect').data(lData.items, function(d) { return d.id; });
        var group = lD3Rects.enter().append('g')
          .attr('transform',  'translate(0,0)')
          .attr('class',      'gm_svg_main_item')
          .attr('rowId',      function(d) { return d.id; })
          .on("click",        function() {
            d3.select(this.parentNode).selectAll('rect').style('fill','#BBB');
            d3.select(this).selectAll('rect').style('fill','#E31F00');
            var lthat = d3.select(this);
            that.OnRowSelect(lthat.attr('rowId'));
          });

        group.append('rect')
          .attr('x',      function(d) { return lGlobals.D3TimeScaleX0 (d3.time.day(d.start))+2 + (((lGlobals.D3TimeScaleX0(d3.time.day.offset(d3.time.day(d.end), 1)) - lGlobals.D3TimeScaleX0(d3.time.day(d.end)) - 4) / d.lanes) * (d.lane-1));})
          .attr('y',      function(d) { return lGlobals.D3TimeScaleY0 (getTime(d.start)); })
          .attr('width',  function(d) { return (lGlobals.D3TimeScaleX0(d3.time.day.offset(d3.time.day(d.end), 1)) - lGlobals.D3TimeScaleX0(d3.time.day(d.end)) - 4) / d.lanes; })
          .attr('height', function(d) { return lGlobals.D3TimeScaleY0 (getTime(d.end)) - lGlobals.D3TimeScaleY0(getTime(d.start));})
          .attr('rx',     '5')
          .attr('ry',     '5');

        group.append('text')
          .attr('x',       function(d) { return lGlobals.D3TimeScaleX0(d3.time.day(d.start))+2 + (((lGlobals.D3TimeScaleX0(d3.time.day.offset(d3.time.day(d.end), 1)) - lGlobals.D3TimeScaleX0(d3.time.day(d.end)) - 4) / d.lanes) * (d.lane-1));})
          .attr('y',       function(d) { return lGlobals.D3TimeScaleY0(getTime(d.start))+19; })
          .attr('dx',      function(d) { return 2; })
          .attr('class',   'gm_svg_main_item_text')
          .text(function(d) { return d3.time.format('%I:%M %p')(d.start); });

        lD3Rects.exit().remove();
      }
      
      gmD3ABSResultPR.prototype.BindEvents = function () {
        SiebelAppFacade.gmD3ABSResultPR.superclass.BindEvents.apply(this, arguments);
      }
      
      gmD3ABSResultPR.prototype.OnRowSelect = function(r) {
        var lPM = this.GetPM();
        if (Number(r) === Number(lPM.Get("GetSelection"))) {
          return true
        }
        SiebelApp.S_App.uiStatus.Busy({});
        if (!lPM.OnControlEvent(gConstants.get("PHYEVENT_SELECT_ROW"), r, "", "")) {
          SiebelApp.S_App.uiStatus.Free();
          return false
        }
        SiebelApp.S_App.uiStatus.Free();
        return true
      };

      gmD3ABSResultPR.prototype.EndLife = function () {
        this.GetD3SVG().remove();
        this.SetD3SVG(null);
        SiebelAppFacade.gmD3ABSResultPR.superclass.EndLife.apply(this, arguments);
      }

      function getTime(aDate) {       
        return new Date(0,0,0,aDate.getHours(),aDate.getMinutes(),aDate.getSeconds());
      }

      return gmD3ABSResultPR;
    }());
    return "SiebelAppFacade.gmD3ABSResultPR";
  })
}
