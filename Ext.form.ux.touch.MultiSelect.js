/*
    Author       : Mitchell Simoens
    Site         : http://simoens.org/Sencha-Projects/demos/
    Contact Info : mitchellsimoens@gmail.com
    Purpose      : Create more customizable Select field
    
    License      : GPL v3 (http://www.gnu.org/licenses/gpl.html)
    Warranty     : none
    Price        : free
    Version      : 1.0
    Date         : 01/09/2011
*/


Ext.define('Ext.form.ux.touch.MultiSelect', {

	extend: 'Ext.form.Select',

	alias: 'widget.multiselectfield',

	config: {
	    columns: 2,
	    selectedItemCls: "x-multiselect-item-selected",
	    itemWidth: 200,
	    itemType: "list",
	    multiSelect: true,
	    delimiter: ",",

		displayField: '',
		valueField: ''
	},

    getDataView: function() {
        var config = this.itemConfig || {};
        
        Ext.applyIf(config, {
            xtype: "dataview",
            store: this.getStore(),
            itemId: "list",
            scroll: false,
	        mode: this.getMultiSelect() ? 'SIMPLE' : 'SINGLE',
	        itemSelector: "div.x-multiselect-item",
            itemTpl: Ext.create('Ext.XTemplate',
                '<div class="x-multiselect-wrap" style="-webkit-column-count: ' + this.getColumns() + ';">',
                    '<tpl for=".">',
                        '<div class="x-multiselect-item">{' + this.getDisplayField() + '}</div>',
                    '</tpl>',
                '</div>'
            )
        });
        
        return config;
    },

    getList: function() {
        var config = this.itemConfig || {};

        Ext.applyIf(config, {
            xtype: "list",
            store: this.getStore(),
            itemId: "list",
            scroll: false,
	        mode: this.getMultiSelect() ? 'SIMPLE' : 'SINGLE',
            itemTpl : [
                '<span class="x-list-label">{' + this.getDisplayField() + '}</span>',
                '<span class="x-list-selected"></span>'
            ].join('')
        });
        
        return config;
    },

    getItemPanel: function() {
        var me = this,
            item;

        if (!me.itemPanel) {
            switch (me.getItemType()) {
                case "dataview" :
                    item = me.getDataView();
                    break;
                case "list" :
                    item = me.getList();
                    break;
            }

            if (typeof item === "undefined") {
                throw "Valid options for itemType - dataview, list, picker";
            }

            item.listeners = {
                scope           : me,
                selectionchange : me.onListSelectionChange
            };

            me.itemPanel = Ext.create('Ext.Panel', {
                modal            : true,
	            top: 0,
	            left: 0,
                stopMaskTapEvent : false,
                hideOnMaskTap    : true,
                cls              : "x-select-overlay",
                scrollable       : "vertical",
                items            : item,
	            layout: 'fit',
                listeners        : {
                    scope : me,
                    hide  : me.destroyItemPanel
                }
            });
        }

        return me.itemPanel;
    },
    
    destroyItemPanel: function() {
        this.itemPanel.destroy();
        delete this.itemPanel;
    },
    
    showPicker: function() {
        var me       = this,
            itemType = me.getItemType(),
            value    = me.getValue(),
            store    = me.getStore(),
            v        = 0,
            recs     = [],
            itemPanel, values, vNum, idx, rec;

        if (itemType === "picker") {
            me.getPicker().show();
        } else {
            itemPanel = me.getItemPanel();

	        Ext.Viewport.add(itemPanel);

            itemPanel.showBy(me.element);
            
            if (!Ext.isEmpty(value)) {
                values = value.toString().split(this.getDelimiter());
                vNum   = values.length;

                for (; v < vNum; v++) {
                    idx = me.findIndex(values[v]);

                    if (idx > -1) {
                        rec = store.getAt(idx);
                        recs.push(rec);
                    }
                }

	            if(recs.length){
                    itemPanel.down('#list').select(recs, false, true)
	            }
            }
        }
        me.isActive = true;
    },

    onListSelectionChange: function(sm, recs) {

        var me         = this,
            valueField = me.getValueField(),
            delimiter  = me.getDelimiter(),
            store      = me.getStore(),
            rNum       = recs.length,
            r          = 0,
            values     = [],
            rec, itemPanel;

        if (rNum > 0) {
            for (; r < rNum; r++) {
                rec = recs[r];

                values.push(rec.get(valueField));
            }
            me.setValue(values.join(delimiter));
            me.fireEvent("selectionchange", this, recs);
        } else {
            me.setValue("");
        }
        if (!me.getMultiSelect()) {
            itemPanel = me.getItemPanel();
            itemPanel.hide();
        }
    },

	applyValue: function(value) {
		var record = value,
			index, store;

		//we call this so that the options configruation gets intiailized, so that a store exists, and we can
		//find the correct value
		this.getOptions();

/*		store = this.getStore();

		if ((value && !value.isModel) && store) {
			index = store.find(this.getValueField(), value, null, null, null, true);

			if (index == -1) {
				index = store.find(this.getDisplayField(), value, null, null, null, true);
			}

			record = store.getAt(index);
		}*/

		return record;
	},

    updateValue: function(value) {
/*	    this.previousRecord = oldValue;
	    this.record = newValue;

	    this.callParent([(newValue && newValue.isModel) ? newValue.get(this.getDisplayField()) : '']);
	   */
	    if(value){
	        var me           = this,
	            store        = me.getStore(),
	            hiddenField  = me.hiddenField,
	            displayField = me.getDisplayField(),
	            delimiter    = me.getDelimiter(),
	            idx          = 0,
	            v            = 0,
	            text         = [],
	            rec, values, vNum;

	        if (value.length > 0 || typeof value === "number") {
	            if (typeof value === "string") {
	                values = value.split(delimiter);
	            } else {
	                values = [value];
	            }

	            vNum = values.length;

	            for (; v < vNum; v++) {
	                idx = this.findIndex(values[v]);

	                if (idx >= 0) {
	                    rec = store.getAt(idx);

	                    text.push(rec.get(displayField));
	                }
	            }
	        }
	        //me._value             = value;

	        //me.getComponent().element.dom.value = text.join(delimiter);

	        if (hiddenField) {
	            hiddenField.dom.value = me.value;
	        }


		    Ext.field.Select.superclass.updateValue.call(this, [text.join(delimiter)]);

		    me.fireEvent("change", me, value);
	    } else {
		    Ext.field.Select.superclass.updateValue.call(this, [value]);
	    }

	    return value;
    },

	getValue: function(){
		return this._value;
	},

    findIndex: function(value) {
        var me         = this,
            valueField = me.getValueField(),
            store      = me.getStore(),
            idx        = store.findBy(function(rec) {
                if (rec.get(valueField) === value) {
                    return true;
                }
            }, me);

        return idx;
    },

    destroy: function() {
        Ext.form.ux.touch.MultiSelect.superclass.destroy.apply(this, arguments);
        Ext.destroy(this.itemPanel);
    }
});
