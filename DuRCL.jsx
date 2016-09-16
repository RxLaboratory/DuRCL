/*



*/

(function (obj) {

	//================
	var version = "0.01";
	//================

	function DuRCL(thisObj)
	{


		//========== FUNCTIONS ============
		
		function bpc(b)
		{
			if (b != 8 && b!= 16 && b!= 32) throw "Invalid bpc. Must be one of: 8, 16, 32";
			if (app.project.bitsPerChannel != b) 
			{
				if (confirm("Warning, project bits per channel is " + app.project.bitsPerChannel + " bpc.\nRendering should be " + b + " bpc.\nDo you want to change the bits per channel to " + b + "?",false,"Invalid bpc"))
				{
					app.project.bitsPerChannel = b;
				}
			}
		}
		
		function disableTextLayers(comp)
		{
			for (var i = 1;i <= comp.numLayers ; i++)
			{
				if (comp.layer(i) instanceof TextLayer)
				{
					comp.layer(i).enabled = false;
				}
			}
		}
		
		function removeTimeCode(comp)
		{
			for (var i = 1;i <= comp.numLayers ; i++)
			{
				var l = comp.layer(i);
				for (var j = 1; j <= l('Effects').numProperties;j++)
				{
					if (l.effect(j).matchName == 'ADBE Timecode') l.effect(j).enabled = false;
				}
			}
		}
		
		function updateOutputTemplatesList()
		{
			//add empty comp to get modules
			var c = app.project.items.addComp("",4, 4, 1, 1, 24);
			var rqItem = app.project.renderQueue.items.add(c);
			var module = rqItem.outputModule(1);
			outputTemplatesList.removeAll();
			for (var i = 0;i < module.templates.length;i++)
			{
				outputTemplatesList.add('item',module.templates[i]);
			}
			rqItem.remove();
			c.remove();
			outputTemplatesList.selection = 0;
		}
		
		
		//=========== EVENTS ============
		
		function renderButtonClicked()
		{
			if (!(app.project.activeItem instanceof CompItem))
			{
				alert("Please select a composition to add to the render queue.");
				return;
			}
			var comp = app.project.activeItem;
			
			//checks
			var bitsPerChannel = 8;
			if (bpcList.selection.index == 1) bitsPerChannel = 16;
			if (bpcList.selection.index == 2) bitsPerChannel = 32;
			bpc(bitsPerChannel);
			if (removeTextLayersButton.value) disableTextLayers(comp);
			if (removeTCButton.value) removeTimeCode(comp);
				
			//add comp to renderQueue
			var rqItem = app.project.renderQueue.items.add(comp);
			rqItem.outputModule(1).applyTemplate(outputTemplatesList.selection.text);
			if (outputPath != '')
			{
				var path = outputPath + "/";
				if (compFolderButton.value)
				{
					path += comp.name + "/";
				}
				
				//create folder
				var p = new Folder(path);
				if (!p.exists) p.create();
				
				path += comp.name + "_[#####]";
					
				var outputFile = new File(path);
				rqItem.outputModule(1).file = outputFile;
			}
			
			
			
			//save
			if (saveButton.value)
			{
				app.project.save();
			}
			
			//start queue
			if (autoStartButton.value)
			{
				app.project.renderQueue.render();
			}
		}
		
		function outputPathButtonClicked()
		{
			var p = Folder.selectDialog("Select the output folder");
			if (p)
			{
				outputPath = p.absoluteURI;
				outputPathButton.text = p.name;
			}
		}
		
		
		//=========== UI ===========
		{

			var  myPal = null;
			thisObj instanceof Panel ? myPal = thisObj : myPal = new Window('palette',"Dugr",undefined, {resizeable:true});

			if (myPal == null) return null;

			// Paramètres de marges et alignements du contenu
			myPal.alignChildren = ['fill','fill'];
			myPal.margins = 5;
			myPal.spacing = 2;
			myPal.orientation = 'column';

			var renderButton = myPal.add('button',undefined,"Render current comp");
			renderButton.onClick = renderButtonClicked;
			var bpcList = myPal.add('dropdownlist',undefined,["8 bpc","16 bpc","32 bpc"]);
			bpcList.selection = 1;
			var outputTemplatesList = myPal.add('dropdownlist');
			updateOutputTemplatesList();
			var removeTCButton = myPal.add('checkbox',undefined,"Disable timecode");
			removeTCButton.value = true;
			var removeTextLayersButton = myPal.add('checkbox',undefined,"Disable text Layers");
			removeTextLayersButton.value = true;
			var saveButton = myPal.add('checkbox',undefined,"Save project");
			saveButton.value = true;
			var outputPathButton = myPal.add('button',undefined,"Output Path");
			var outputPath = '';
			outputPathButton.onClick = outputPathButtonClicked;
			var compFolderButton = myPal.add('checkbox',undefined,"Subfolder with comp name");
			compFolderButton.value = true;
			var autoStartButton = myPal.add('checkbox',undefined,"Auto start rendering");
			//var outputPath = myPal.add('edittext',undefined,"output path");
			

			// On définit le layout et on redessine la fenètre quand elle est resizée
			myPal.layout.layout(true);
			myPal.layout.resize();
			myPal.onResizing = myPal.onResize = function () {this.layout.resize();}
		}


		return myPal;
	} //FONCTION DugrUI



	// On execute la creation de l'UI
	var myPalette = DuRCL(obj);
	// Si c'est une fenetre (pas lance depuis ScriptUI Panels) il faut l'afficher
	if (myPalette != null && myPalette instanceof Window) {
	//myPalette.center();
	myPalette.show();
	}

})(this);





