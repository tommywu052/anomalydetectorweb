export class DimensionHelper {
    static isAllupDimension(allupIdentification, dimensionValue) {
        if(allupIdentification == null) {
            if(dimensionValue == null || dimensionValue == "" || dimensionValue == "##EMPTY##awqegp##") {
                return true;
            } else {
                return false;
            }
        } else if(allupIdentification == "##NULL##awqegp##") {
            if(dimensionValue == null || dimensionValue == "") {
                return true;
            } else {
                return false;
            }
        } else {
            if(allupIdentification == dimensionValue) {
                return true;
            } else{
                return false;
            }
        }
    }

    static getDimensionDisplayValue(allupIdentification, dimensionValue) {
        if(DimensionHelper.isAllupDimension(allupIdentification, dimensionValue)) {
            if (dimensionValue == "##EMPTY##awqegp##" || dimensionValue == "") {
                return "<-Allup-> (from Empty)";
            }
            else if (dimensionValue == null) {
                return "<-Allup-> (from NULL)";
            }
            else {
                return "<-Allup->";
            }
        } else {
            if(dimensionValue == null) {
                return "<-NULL->";
            } else if(dimensionValue == "##EMPTY##awqegp##") {
                return "<-EMPTY->";
            }
            else {
                return dimensionValue;
            }
        }
    }

    static isAllupDimensionWithGlobal(dimensionValue){
        return DimensionHelper.isAllupDimension(window.g_allupIdentification, dimensionValue);
    }

    static getDimensionDisplayValueWithGlobal(dimensionValue) {
        return DimensionHelper.getDimensionDisplayValue(window.g_allupIdentification,dimensionValue);
    }
}